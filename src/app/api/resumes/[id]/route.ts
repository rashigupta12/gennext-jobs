import { NextResponse } from "next/server";
import { db } from "@/db";
import { ResumesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const resume = await db
      .select()
      .from(ResumesTable)
      .where(eq(ResumesTable.id, id as string))
      .limit(1);

    if (!resume.length) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resume[0]);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await context.params; // ⬅️ must await
    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const data = Object.fromEntries(formData);

    const updatedResume = await db
      .update(ResumesTable)
      .set(data)
      .where(eq(ResumesTable.id, resumeId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedResume,
      message: "Resume updated successfully",
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update resume" },
      { status: 500 }
    );
  }
}