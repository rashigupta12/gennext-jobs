import { NextResponse } from "next/server";
import { CompaniesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";

// Validation schema for company creation
const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  about: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().max(100).optional(),
  rating: z.string().max(10).optional(),
  isVerified: z.boolean().default(false),
  createdBy: z.string().optional(), // Assuming this is a string, adjust as necessary
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verified = searchParams.get("verified");
    const industry = searchParams.get("industry");
    const companyId = searchParams.get("id");
    const userid = searchParams.get("userid");
    const adminId = searchParams.get("adminId");
    
    // Build conditions array
    const conditions = [];
    if (adminId) {
      conditions.push(eq(CompaniesTable.adminId, adminId));
    }
    
    if (companyId) {
      conditions.push(eq(CompaniesTable.id, companyId));
    }
    
    if (verified === "true") {
      conditions.push(eq(CompaniesTable.isVerified, true));
    }
    
    if (industry) {
      conditions.push(eq(CompaniesTable.industry, industry));
    }
    if (userid) {
      conditions.push(eq(CompaniesTable.createdBy, userid));
    }
    
    // Execute query with all conditions
    const companies = conditions.length > 0
      ? await db.select().from(CompaniesTable).where(and(...conditions))
      : await db.select().from(CompaniesTable);
    
    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    
    const data = {
      ...validation.data,
      createdBy: validation.data.createdBy ?? "", // Provide a default value if undefined
    };
    
    // Create company
    const [newCompany] = await db
      .insert(CompaniesTable)
      .values(data)
      .returning();
      
    return NextResponse.json({ company: newCompany }, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("id");
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }
    
    // Delete company
    const result = await db
      .delete(CompaniesTable)
      .where(eq(CompaniesTable.id, companyId));
      
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  try{
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("id");
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    // Validate input
    const validation = createCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    const data = {
      ...validation.data,
      createdBy: validation.data.createdBy ?? "", // Provide a default value if undefined
    };
    // Update company
    const [updatedCompany] = await db
      .update(CompaniesTable)
      .set(data)
      .where(eq(CompaniesTable.id, companyId))
      .returning();
    if (!updatedCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ company: updatedCompany }, { status: 200 });
  }
  catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}