// api.ts
import { JobApplication, JobListing, Company, Category, Subcategory, Resume } from './types';

export const fetchAllJobs = async () => {
  try {
    const response = await fetch("/api/job-listing");
    if (!response.ok) throw new Error("Failed to fetch all jobs");
    const data = await response.json();
    return data.jobListings || []; // Ensure a fallback to an emptya array
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    throw error;
  }
};

export const fetchJobApplications = async (userId: string): Promise<JobApplication[]> => {
  const response = await fetch(`/api/application?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch applications');

  return response.json();
};

export const fetchJobDetails = async (jobIds: string[]): Promise<JobListing[]> => {
  try {
    const response = await fetch(`/api/job-listing?jobIds=${jobIds.join(',')}`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    
    const jobsData = await response.json();
    
    // Ensure jobsData.jobListings is an array
    if (!Array.isArray(jobsData.jobListings)) {
      throw new Error("Expected an array of jobs, but received something else");
    }
    
    return jobsData.jobListings; // Return the jobListings array
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw error;
  }
};

export const fetchCompanies = async (companyIds: string[]): Promise<Company[]> => {
  const response = await fetch(`/api/companies?ids=${companyIds.join(',')}`);

  if (!response.ok) throw new Error('Failed to fetch companies');
  const result = await response.json();
  if (!Array.isArray(result.companies)) {
    throw new Error("Expected an array of companies, but received something else");
  }
  return result.companies;
};

export const fetchCategories = async (categoryIds: string[]): Promise<Category[]> => {
  // Create URL with proper query parameters
  const url = new URL('/api/categories', window.location.origin);
  
  // Add each ID as a separate query parameter
  categoryIds.forEach(id => {
    url.searchParams.append('ids', id);
  });
  
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch categories');
  const result = await response.json();
  
  if (!Array.isArray(result.categories)) {
    throw new Error("Expected an array of categories, but received something else");
  }

  return result.categories;
};

export const fetchSubcategories = async (subcategoryIds: string[]): Promise<Subcategory[]> => {
  if (subcategoryIds.length === 0) return [];
  
  // Create URL with proper query parameters
  const url = new URL('/api/subCategories', window.location.origin);
  
  // Add each ID as a separate query parameter
  subcategoryIds.forEach(id => {
    url.searchParams.append('subcategoryIds', id);
  });
  
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch subcategories');
  const result = await response.json();
  
  if (!Array.isArray(result.subcategories)) {
    throw new Error("Expected an array of subcategories, but received something else");
  }

  return result.subcategories;
};

export const fetchResumes = async (resumeIds: string[]): Promise<Resume[]> => {
  const response = await fetch(`/api/resumes?ids=${resumeIds.join(',')}`);
  if (!response.ok) throw new Error('Failed to fetch resumes');
  const result= await response.json();
  if (!Array.isArray(result.data)) {
    throw new Error("Expected an array of jobs, but received something else");
  }
  
  return result.data;
};

export async function fetchAllJobLocations(): Promise<string[]> {
  try {
    const response = await fetch('/api/job-location', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job locations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.locations;
  } catch (error) {
    console.error('Error fetching job locations:', error);
    return []; // Return empty array if fetch fails
  }
}