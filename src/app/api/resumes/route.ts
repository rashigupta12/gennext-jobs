import { NextResponse } from "next/server";
import { db } from "@/db";
import { ResumesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const userId = formData.get("userId") as string;
    const education = formData.get("education") as string;
    const experience = formData.get("experience") as string;
    const skills = formData.get("skills") as string;
    const resumeUrl = formData.get("resumeUrl") as string;

    const resumeData = {
      userId: userId || "fd6a9639-b413-44b9-9f2b-53900425053e", // Default ID if missing
      resumeUrl: resumeUrl || "",
      experience: JSON.stringify(experience), // Ensure string format
      skills: skills, // Assuming it's already a comma-separated string
      education: JSON.stringify(education), // Ensure string format
    };

    // Insert and return full row
    const insertedResume = await db
      .insert(ResumesTable)
      .values(resumeData)
      .returning(); // Fetch the inserted row

    return NextResponse.json(
      { message: "Resume created successfully", data: insertedResume[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Resume creation error:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
// app/api/resumes/route.ts
// import { NextResponse } from "next/server";
// import { db } from "@/db";
// import { ResumesTable } from "@/db/schema";
// import { eq } from "drizzle-orm";

// Get all resumes with pagination
export async function GET(req : Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  try {

    if(userId){
      const resumes = await db
        .select()
        .from(ResumesTable)
        .where(eq(ResumesTable.userId, userId));
      
      return NextResponse.json({
        success: true,
        data: resumes,
        message: "Resumes retrieved successfully"
    })
  }
    const resumes = await db.select().from(ResumesTable);
    
    return NextResponse.json({
      success: true,
      data: resumes,
      message: "Resumes retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}



export async function PUT(
  req: Request,
) {
  const { searchParams } = new URL(req.url);

  try {
    const resumeId = searchParams.get("id");
    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }
    const formData = await req.formData();
    const data = Object.fromEntries(formData);
    console.log(data);

    // Update the resume in the database
    const updatedResume = await db.update(ResumesTable)
      .set(data)
      .where(eq(ResumesTable.id, resumeId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedResume,
      message: "Resume updated successfully"
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { success: false, message: "Failed to update resume" },
      { status: 500 }
    );
  }
}




// Optional: Search endpoint
// app/api/resumes/search/route.ts
