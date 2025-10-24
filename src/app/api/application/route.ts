/*eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { JobApplicationsTable, JobListingsTable, UsersTable, ResumesTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { inArray } from "drizzle-orm/expressions";

// Validation schema for job application creation
const createJobApplicationSchema = z.object({
  jobId: z.string().uuid(),
  userId: z.string().uuid(),
  resumeId: z.string().uuid(),
  coverLetter: z.string().optional(),
  status: z.string().default("PENDING"),
});

// Validation schema for job application update
const updateJobApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["PENDING", "SHORTLISTED", "REJECTED", "HIRED"]).optional(),
  coverLetter: z.string().optional(),
});

// Validation schema for job application deletion
const deleteJobApplicationSchema = z.object({
  applicationId: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Get jobIds and userId parameters
    const jobIdsParam = searchParams.get("jobIds");
    const userId = searchParams.get("userId");

    // Validate jobIds parameter if provided
    let jobIds: string[] = [];
    if (jobIdsParam) {
      const jobIdsArray = jobIdsParam.split(",").filter(id => id.trim() !== "");
      const jobIdsSchema = z.array(z.string().uuid());
      const parsedJobIds = jobIdsSchema.safeParse(jobIdsArray);

      if (!parsedJobIds.success) {
        return NextResponse.json({ error: "Invalid job IDs format" }, { status: 400 });
      }
      jobIds = parsedJobIds.data;
    }

    // Validate userId if provided
    if (userId) {
      const userIdSchema = z.string().uuid();
      if (!userIdSchema.safeParse(userId).success) {
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
      }
    }

    // Build query conditions
    const conditions = [];
    if (jobIds.length > 0) {
      conditions.push(inArray(JobApplicationsTable.jobId, jobIds));
    }
    if (userId) {
      conditions.push(eq(JobApplicationsTable.userId, userId));
    }

    // Fetch job applications based on conditions
    const applications = await db
      .select({
        id: JobApplicationsTable.id,
        jobId: JobApplicationsTable.jobId,
        userId: JobApplicationsTable.userId,
        resumeId: JobApplicationsTable.resumeId,
        coverLetter: JobApplicationsTable.coverLetter,
        status: JobApplicationsTable.status,
        appliedAt: JobApplicationsTable.appliedAt,
        updatedAt: JobApplicationsTable.updatedAt,
        job: {
          id: JobListingsTable.id,
          title: JobListingsTable.title,
          company: JobListingsTable.companyId,
        },
        user: {
          id: UsersTable.id,
          name: UsersTable.name,
          email: UsersTable.email,
        },
        resume: {
          id: ResumesTable.id,
          resumeUrl: ResumesTable.resumeUrl,
        },
      })
      .from(JobApplicationsTable)
      .leftJoin(JobListingsTable, eq(JobApplicationsTable.jobId, JobListingsTable.id))
      .leftJoin(UsersTable, eq(JobApplicationsTable.userId, UsersTable.id))
      .leftJoin(ResumesTable, eq(JobApplicationsTable.resumeId, ResumesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Error fetching job applications:", (error as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createJobApplicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Check if job exists and is active
    const job = await db
      .select()
      .from(JobListingsTable)
      .where(
        and(
          eq(JobListingsTable.id, data.jobId),
          eq(JobListingsTable.isActive, true)
        )
      )
      .limit(1);
      
    if (job.length === 0) {
      return NextResponse.json(
        { error: "Job not found or not active" },
        { status: 404 }
      );
    }
    
    // Check if user exists
    const user = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, data.userId))
      .limit(1);
      
    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if resume exists and belongs to the user
    const resume = await db
      .select()
      .from(ResumesTable)
      .where(
        and(
          eq(ResumesTable.id, data.resumeId),
          eq(ResumesTable.userId, data.userId)
        )
      )
      .limit(1);
      
    if (resume.length === 0) {
      return NextResponse.json(
        { error: "Resume not found or does not belong to user" },
        { status: 404 }
      );
    }
    
    // Check if user has already applied to this job
    const existingApplication = await db
      .select()
      .from(JobApplicationsTable)
      .where(
        and(
          eq(JobApplicationsTable.jobId, data.jobId),
          eq(JobApplicationsTable.userId, data.userId)
        )
      )
      .limit(1);
      
    if (existingApplication.length > 0) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }
    
    // Create job application
    const [newApplication] = await db
      .insert(JobApplicationsTable)
      .values(data)
      .returning();
      
    // Update applicants count for the job
    await db
      .update(JobListingsTable)
      .set({
        applicantsCount: (job[0]?.applicantsCount ?? 0) + 1,
      })
      .where(eq(JobListingsTable.id, data.jobId));
      
    return NextResponse.json({ application: newApplication }, { status: 201 });
  } catch (error) {
    console.error("Error creating job application:", error);
    return NextResponse.json(
      { error: "Failed to create job application" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = updateJobApplicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { applicationId, status, coverLetter } = validation.data;
    
    // Check if application exists
    const existingApplication = await db
      .select()
      .from(JobApplicationsTable)
      .where(eq(JobApplicationsTable.id, applicationId))
      .limit(1);
      
    if (existingApplication.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (coverLetter !== undefined) {
      updateData.coverLetter = coverLetter;
    }
    
    // Update the application
    const [updatedApplication] = await db
      .update(JobApplicationsTable)
      .set(updateData)
      .where(eq(JobApplicationsTable.id, applicationId))
      .returning();
      
    return NextResponse.json(
      { 
        message: "Application updated successfully",
        application: updatedApplication 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job application:", error);
    return NextResponse.json(
      { error: "Failed to update job application" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For PUT, we require all fields (full replacement)
    const putSchema = z.object({
      applicationId: z.string().uuid(),
      status: z.enum(["PENDING", "SHORTLISTED", "REJECTED", "HIRED"]),
      coverLetter: z.string(),
    });
    
    const validation = putSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { applicationId, status, coverLetter } = validation.data;
    
    // Check if application exists
    const existingApplication = await db
      .select()
      .from(JobApplicationsTable)
      .where(eq(JobApplicationsTable.id, applicationId))
      .limit(1);
      
    if (existingApplication.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Full replacement of updatable fields
    const [updatedApplication] = await db
      .update(JobApplicationsTable)
      .set({
        status,
        coverLetter,
        updatedAt: new Date(),
      })
      .where(eq(JobApplicationsTable.id, applicationId))
      .returning();
      
    return NextResponse.json(
      { 
        message: "Application replaced successfully",
        application: updatedApplication 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error replacing job application:", error);
    return NextResponse.json(
      { error: "Failed to replace job application" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get applicationId from query parameters
    const applicationId = searchParams.get("applicationId");

    // Validate applicationId
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const validation = deleteJobApplicationSchema.safeParse({ applicationId });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid application ID format" },
        { status: 400 }
      );
    }

    // Fetch the application to get the associated jobId
    const application = await db
      .select()
      .from(JobApplicationsTable)
      .where(eq(JobApplicationsTable.id, applicationId))
      .limit(1);

    if (application.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const jobId = application[0].jobId;

    // Delete the application
    await db
      .delete(JobApplicationsTable)
      .where(eq(JobApplicationsTable.id, applicationId));

    // Fetch the job to get the current applicants count
    const job = await db
      .select({
        applicantsCount: JobListingsTable.applicantsCount,
      })
      .from(JobListingsTable)
      .where(eq(JobListingsTable.id, jobId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Decrement applicants count for the job
    await db
      .update(JobListingsTable)
      .set({
        applicantsCount: Math.max(0, (job[0].applicantsCount ?? 0) - 1),
      })
      .where(eq(JobListingsTable.id, jobId));

    return NextResponse.json(
      { message: "Application deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job application:", error);
    return NextResponse.json(
      { error: "Failed to delete job application" },
      { status: 500 }
    );
  }
}