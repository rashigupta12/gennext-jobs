// /app/api/job-listings/route.ts
import { NextResponse } from "next/server";
import { JobListingsTable, CompaniesTable, CategoriesTable, SubcategoriesTable } from "@/db/schema";

import { and, eq, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";

// Validation schema for job listing creation
const createJobListingSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(255).optional(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  duration: z.string().max(50).optional(),
  salary: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  startDate: z.string().max(100).optional(),
  openings: z.number().int().positive().default(1),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  role: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]).default("FULL_TIME"),
  education: z.string().max(200).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
  userId: z.string().uuid(), // Optional userId for the creator
});


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const categoryId = searchParams.get("categoryId");
    const subcategoryId = searchParams.get("subcategoryId");
    const companyId = searchParams.get("companyId");
    const featured = searchParams.get("featured");
    const employmentType = searchParams.get("employmentType");
    const userId = searchParams.get("userId");
    const jobIdsParam = searchParams.get("jobIds");
    const jobIds = jobIdsParam ? jobIdsParam.split(",") : [];
    
    // Get pagination parameters with better defaults
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limitParam = searchParams.get("limit");
    const limit = limitParam === "all" 
      ? 10000  // Very high number to get all records
      : Math.max(1, parseInt(limitParam || "10", 10));
    const skip = (page - 1) * limit;

    // Build conditions array
    const conditions = [];

    if (categoryId) {
      conditions.push(eq(JobListingsTable.categoryId, categoryId));
    }

    if (subcategoryId) {
      conditions.push(eq(JobListingsTable.subcategoryId, subcategoryId));
    }

    if (companyId) {
      conditions.push(eq(JobListingsTable.companyId, companyId));
    }

    if (featured === "true") {
      conditions.push(eq(JobListingsTable.isFeatured, true));
    }

    if (employmentType) {
      conditions.push(
        eq(JobListingsTable.employmentType, employmentType as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE")
      );
    }

    if (userId) {
      conditions.push(eq(JobListingsTable.userId, userId));
    }

    // Add condition for job IDs
    if (jobIds.length > 0) {
      conditions.push(inArray(JobListingsTable.id, jobIds));
    }

    // Only add isActive filter if not specifically filtered by other criteria
    // This ensures we only show active jobs by default
    // if (!userId && jobIds.length === 0) {
    //   conditions.push(eq(JobListingsTable.isActive, true));
    // }
    
    // Fetch job listings with conditions
    const jobListings = await db
      .select()
      .from(JobListingsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(JobListingsTable.postedAt))
      .limit(limit)
      .offset(skip);

    // Fetch total count for pagination
    const totalCountResult = conditions.length > 0
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(JobListingsTable)
          .where(and(...conditions))
      : await db
          .select({ count: sql<number>`count(*)` })
          .from(JobListingsTable);

    const totalItems = Number(totalCountResult[0].count);

    return NextResponse.json(
      {
        jobListings,
        pagination: {
          page,
          limit: limitParam === "all" ? totalItems : limit,
          totalItems,
          totalPages: limitParam === "all" ? 1 : Math.ceil(totalItems / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job listings. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Creating job listing...");
    const body = await request.json();
    
    // Validate input
    const validation = createJobListingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    const data = {
      ...validation.data,
      userId: validation.data.userId ?? undefined, // Ensuring userId is undefined if null
    };
    
    
    // Check if company exists
    const company = await db
      .select()
      .from(CompaniesTable)
      .where(eq(CompaniesTable.id, data.companyId))
      .limit(1);
      
    if (company.length === 0) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }
    
    // Check if category exists
    const category = await db
      .select()
      .from(CategoriesTable)
      .where(eq(CategoriesTable.id, data.categoryId))
      .limit(1);
      
    if (category.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Check if subcategory exists (if provided)
    if (data.subcategoryId) {
      const subcategory = await db
        .select()
        .from(SubcategoriesTable)
        .where(eq(SubcategoriesTable.id, data.subcategoryId))
        .limit(1);
        
      if (subcategory.length === 0) {
        return NextResponse.json(
          { error: "Subcategory not found" },
          { status: 404 }
        );
      }
    }
    
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/\s+/g, "-");
    }
    
    // Create job listing
    const [newJobListing] = await db
      .insert(JobListingsTable)
      .values(data)
      .returning();
      
    return NextResponse.json({ jobListing: newJobListing }, { status: 201 });
  } catch (error) {
    console.error("Error creating job listing:", error);
    return NextResponse.json(
      { error: "Failed to create job listing" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    // Validate input
    const validation = createJobListingSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Check if job listing exists
    const jobListing = await db
      .select()
      .from(JobListingsTable)
      .where(eq(JobListingsTable.id, id))
      .limit(1);

    if (jobListing.length === 0) {
      return NextResponse.json(
        { error: "Job listing not found" },
        { status: 404 }
      );
    }

    // Update job listing
    const [updatedJobListing] = await db
      .update(JobListingsTable)
      .set(validation.data)
      .where(eq(JobListingsTable.id, id))
      .returning();

    return NextResponse.json({ jobListing: updatedJobListing }, { status: 200 });
  } catch (error) {
    console.error("Error updating job listing:", error);
    return NextResponse.json(
      { error: "Failed to update job listing" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Job listing ID is required" },
        { status: 400 }
      );
    }

    // Check if job listing exists
    const jobListing = await db
      .select()
      .from(JobListingsTable)
      .where(eq(JobListingsTable.id, id))
      .limit(1);

    if (jobListing.length === 0) {
      return NextResponse.json(
        { error: "Job listing not found" },
        { status: 404 }
      );
    }

    // Delete job listing
    await db.delete(JobListingsTable).where(eq(JobListingsTable.id, id));

    return NextResponse.json({ message: "Job listing deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting job listing:", error);
    return NextResponse.json(
      { error: "Failed to delete job listing" },
      { status: 500 }
    );
  }
}