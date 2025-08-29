// api/job-listing.ts
import { z } from 'zod';

// Schema definition
export const createJobListingSchema = z.object({
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
  expiresAt: z.string().datetime().optional(),
});

// Types derived from the schema
export type JobListingFormData = z.infer<typeof createJobListingSchema>;

// API endpoints
export async function fetchCategories() {
  try {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    return data.categories; // Adjust based on your API structure
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchSubcategories(categoryId: string) {
  try {
    const response = await fetch(`/api/subCategories?categoryId=${categoryId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch subcategories");
    }
    const data = await response.json();
    return data.subcategories; // Adjust based on your API structure
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

export async function fetchCompanies(userid: string) {

  try {
    console.log("Fetching companies for user ID:", userid);
    const response = await fetch(`/api/users?Id=${userid}`);
    if (!response.ok) {
      throw new Error("Failed to fetch companies");
    }
    const data = await response.json();
    
    // Filter companies to return only the one linked to the admin
    console.log("Fetched companies:", data.data.companyId);


    const companyResponse = await fetch(`/api/companies?id=${data.data.companyId}`);
    if (!companyResponse.ok) {
      throw new Error("Failed to fetch companies");
    }
    const companyData = await companyResponse.json();
    console.log("Fetched companies data:", companyData.companies[0]);
    return companyData.companies; // Adjust based on your API structure


    return data.data
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}


export async function createCategory(newCategoryName: string) {
  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newCategoryName }),
    });

    if (!response.ok) {
      throw new Error("Failed to add category");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
}

export async function createSubcategory(newSubcategoryName: string, categoryId: string) {
  try {
    const response = await fetch("/api/subCategories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newSubcategoryName, categoryId }),
    });

    if (!response.ok) {
      throw new Error("Failed to add subcategory");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding subcategory:", error);
    throw error;
  }
}

export async function createCompany(newCompanyName: string) {
  try {
    const response = await fetch("/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newCompanyName }),
    });

    if (!response.ok) {
      throw new Error("Failed to add company");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding company:", error);
    throw error;
  }
}

export async function createJobListing(formData: JobListingFormData) {
  try {
    // Validate the data with Zod before sending
    createJobListingSchema.parse(formData);
    
    const response = await fetch("/api/job-listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create job listing");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating job listing:", error);
    throw error;
  }
}