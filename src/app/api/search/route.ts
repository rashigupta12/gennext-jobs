import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  JobListingsTable,
  // CategoriesTable,
  // SubcategoriesTable,
  CompaniesTable,
  // UsersTable
} from '../../../db/schema';
import { eq, and, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const location = searchParams.get('location');
    const experience = searchParams.get('experience');
    const employmentType = searchParams.get('employmentType');
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');
    const companyId = searchParams.get('companyId');
    const industry = searchParams.get('industry');

    // Build the search conditions
    const conditions = [];

    // Filter by active jobs by default
    conditions.push(eq(JobListingsTable.isActive, true));

    // Apply filters based on query parameters
    if (query) {
      // Normalize the query: Replace "+" with "-" and spaces with "-"
      const normalizedQuery = query.replace(/\+/g, '-').replace(/\s+/g, '-').replace(/-/g, ' ');
      const searchPattern = `%${normalizedQuery}%`;


      const employmentTypeMap = {
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACT',
        'internship': 'INTERNSHIP',
        'freelance': 'FREELANCE',
      };

      // Use the normalized query to look up the employment type
      const employmentTypeValue = employmentTypeMap[normalizedQuery.toLowerCase() as keyof typeof employmentTypeMap];

      if (employmentTypeValue) {
        conditions.push(eq(JobListingsTable.employmentType, employmentTypeValue as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'));
      } else {
        conditions.push(
          or(
            sql`LOWER(${JobListingsTable.title}::text) LIKE LOWER(${searchPattern})`,
            sql`LOWER(${JobListingsTable.description}::text) LIKE LOWER(${searchPattern})`,
            sql`LOWER(${JobListingsTable.role}::text) LIKE LOWER(${searchPattern})`,
            sql`LOWER(${JobListingsTable.department}::text) LIKE LOWER(${searchPattern})`,
            sql`LOWER(${JobListingsTable.skills}::text) LIKE LOWER(${searchPattern})`
          )
        );
      }
    }
    if (location) {
      const locationPattern = `%${location}%`;
      conditions.push(sql`LOWER(${JobListingsTable.location}) LIKE LOWER(${locationPattern})`);
    }

    if (employmentType) {
      if (['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'].includes(employmentType)) {
        conditions.push(eq(JobListingsTable.employmentType, employmentType as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'));
      }
    }

    if (categoryId) {
      conditions.push(eq(JobListingsTable.categoryId, categoryId));
    }

    if (subcategoryId) {
      conditions.push(eq(JobListingsTable.subcategoryId, subcategoryId));
    }

    if (companyId) {
      conditions.push(eq(JobListingsTable.companyId, companyId));
    }

    // Handle experience range (e.g., "1-3" years)
    if (experience) {
      // Implementation depends on how experience is stored in your database
      // This is just a placeholder logic
      if (experience === '0-1') {
        // Logic for 0-1 years experience
      } else if (experience === '1-3') {
        // Logic for 1-3 years experience
      }
      // etc.
    }

    // Fetch jobs based on conditions
    const jobQuery = db
      .select({
        id: JobListingsTable.id,
        title: JobListingsTable.title,
        companyId: JobListingsTable.companyId,
        location: JobListingsTable.location,
        employmentType: JobListingsTable.employmentType,
        salary: JobListingsTable.salary,
        postedAt: JobListingsTable.postedAt,
        isFeatured: JobListingsTable.isFeatured
      })
      .from(JobListingsTable)
      .where(and(...conditions))
      .limit(20);

    // Execute the query
    const jobResults = await jobQuery;

    // If industry filter is applied, filter jobs by company industry
    let filteredJobs = jobResults;
    if (industry) {
      // Get company IDs with the specified industry
      const companyIds = await db
        .select({ id: CompaniesTable.id })
        .from(CompaniesTable)
        .where(sql`LOWER(${CompaniesTable.industry}) LIKE LOWER(${`%${industry}%`})`);

      const industryCompanyIds = companyIds.map(c => c.id);

      // Filter jobs by these company IDs
      filteredJobs = jobResults.filter(job =>
        industryCompanyIds.includes(job.companyId)
      );
    }

    // For company search results (when query is provided)
    let companyResults: { id: string; name: string; logo: string | null; industry: string | null }[] = [];
    if (query) {
      const searchPattern = `%${query}%`;

      companyResults = await db
        .select({
          id: CompaniesTable.id,
          name: CompaniesTable.name,
          logo: CompaniesTable.logo,
          industry: CompaniesTable.industry
        })
        .from(CompaniesTable)
        .where(sql`LOWER(${CompaniesTable.name}) LIKE LOWER(${searchPattern})`)
        .limit(5);
    }

    // Return search results
    return NextResponse.json({
      jobs: filteredJobs,
      companies: companyResults,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}