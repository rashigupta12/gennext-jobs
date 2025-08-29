// /app/api/job-locations/route.ts
import { NextResponse } from "next/server";
import { JobListingsTable } from "@/db/schema";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if we should include empty locations
    const includeEmpty = searchParams.get("includeEmpty") === "true";
    
    // Check if we want a count of jobs per location
    const withCount = searchParams.get("withCount") === "true";
    
    let query;
    
    if (withCount) {
      // Return locations with job counts
      query = db
        .select({
          location: JobListingsTable.location,
          count: sql<number>`count(*)`.as("count")
        })
        .from(JobListingsTable)
        .where(includeEmpty ? undefined : sql`${JobListingsTable.location} IS NOT NULL AND ${JobListingsTable.location} != ''`)
        .groupBy(JobListingsTable.location)
        .orderBy(JobListingsTable.location);
    } else {
      // Return just the unique locations
      query = db
        .selectDistinct({ location: JobListingsTable.location })
        .from(JobListingsTable)
        .where(includeEmpty ? undefined : sql`${JobListingsTable.location} IS NOT NULL AND ${JobListingsTable.location} != ''`)
        .orderBy(JobListingsTable.location);
    }
    
    const locations = await query;
    
    return NextResponse.json({ 
      locations: withCount ? locations : locations.map(item => item.location),
      total: locations.length
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch job locations. Please try again later." },
      { status: 500 }
    );
  }
}