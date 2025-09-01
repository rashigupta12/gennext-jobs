import {
  JobApplication,
  JobListing,
  Company,
  Category,
  Subcategory,
  Resume,
  JobApplicationView,
  ApplicationStatus,
  Filters,
} from './types';

// Create a lookup map for faster access
export const createLookupMap = <T extends { id: string }>(data: T[]): Map<string, T> => {
  return new Map(data.map(item => [item.id, item]));
};

// Combine all data into a single view for job applications
export const combineData = (
  jobApplications: JobApplication[],
  jobsData: JobListing[],
  companiesData: Company[],
  categoriesData: Category[],
  subcategoriesData: Subcategory[],
  resumesData: Resume[],
  statusOptions: ApplicationStatus[],
  fieldsToInclude?: {
    application?: boolean;
    job?: boolean;
    company?: boolean;
    category?: boolean;
    subcategory?: boolean;
    status?: boolean;
    resume?: boolean;
  }
): Partial<JobApplicationView>[] => {
  const jobsMap = createLookupMap(jobsData);
  const companiesMap = createLookupMap(companiesData);
  const categoriesMap = createLookupMap(categoriesData);
  const subcategoriesMap = createLookupMap(subcategoriesData);
  const resumesMap = createLookupMap(resumesData);

  // Default to including all fields if not specified
  const fields = fieldsToInclude || {
    application: true,
    job: true,
    company: true,
    category: true,
    subcategory: true,
    status: true,
    resume: true
  };

  return jobApplications.map(application => {
    const result: Partial<JobApplicationView> = {};

    if (fields.application) {
      result.application = application;
    }

    if (fields.job) {
      result.job = jobsMap.get(application.jobId)!;
    }

    if (fields.company) {
      const job = jobsMap.get(application.jobId)!;
      result.company = companiesMap.get(job.companyId)!;
    }

    if (fields.category) {
      const job = jobsMap.get(application.jobId)!;
      result.category = categoriesMap.get(job.categoryId)!;
    }

    if (fields.subcategory) {
      const job = jobsMap.get(application.jobId)!;
      result.subcategory = job.subcategoryId ? subcategoriesMap.get(job.subcategoryId) : undefined;
    }

    if (fields.status) {
      result.status = statusOptions.find(s => s.id === application.status) || statusOptions[0];
    }

    if (fields.resume) {
      result.resume = resumesMap.get(application.resumeId)!;
    }

    return result;
  });
};

// Combine job data with related entities for job listings
export const combineJobData = (
  jobs: JobListing[],
  companies: Company[],
  categories: Category[],
  subcategories: Subcategory[]
): { job: JobListing; company: Company; category: Category; subcategory?: Subcategory }[] => {
  return jobs.map((job) => {
    const company = companies.find((c) => c.id === job.companyId) || {
      id: "",
      name: "",
      createdBy: "",
      recruiter: [],
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const category = categories.find((c) => c.id === job.categoryId) || {
      id: "unknown",
      name: "Uncategorized",
      createdBy: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true, // Added the required isActive property
    };
    const subcategory = job.subcategoryId
      ? subcategories.find((s) => s.id === job.subcategoryId)
      : undefined;

    return {
      job,
      company,
      category,
      subcategory,
    };
  });
};

// Interface for Salary
export interface Salary {
  min: number;
  max: number;
}

// Filter jobs based on filters
export const filterJobs = (
  jobs: { job: JobListing; company: Company; category: Category; subcategory?: Subcategory }[],
  filters: Filters
) => {
  const currentDate = new Date();
  
  return jobs.filter((item) => {
    const job = item.job;

    // Filter out expired jobs
    if (job.expiresAt) {
      const expiresAtDate = new Date(job.expiresAt);
      if (expiresAtDate < currentDate) {
        return false; // Skip expired jobs
      }
    }

    // Search filter
    if (
      filters.search &&
      !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !job.description
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      !item.company.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      // Check if any skills match the search term (if job has skills)
      !(
        job.skills &&
        job.skills.some(skill =>
          skill.toLowerCase().includes(filters.search.toLowerCase())
        )
      ) &&
      // Check location
      !job.location?.toLowerCase().includes(filters.search.toLowerCase()) &&
      // Check employment type
      !job.employmentType.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Skills filter (if skills filter is present in filters)
    if (filters.skills && filters.skills.length > 0) {
      // If job has no skills or skills is empty, filter it out
      if (!job.skills || job.skills.length === 0) {
        return false;
      }

      // Check if job has at least one of the required skills
      const hasRequiredSkill = filters.skills.some(requiredSkill =>
        job.skills!.some(skill =>
          skill.toLowerCase() === requiredSkill.toLowerCase()
        )
      );

      if (!hasRequiredSkill) {
        return false;
      }
    }
    // Location filter
    if (
      filters.location.length > 0 &&
      job.location && !filters.location.includes(job.location)
    ) {
      return false;
    }

    // Employment type filter
    if (
      filters.employmentType.length > 0 &&
      !filters.employmentType.includes(job.employmentType)
    ) {
      return false;
    }

    // Salary range filter - Updated for new format
    if ((filters.salaryMin || filters.salaryMax) && job.salary) {
      try {
        // Parse the job salary to extract numeric values
        const jobSalary = job.salary.trim();
        let jobMonthlySalary = 0;

        // Parse different salary formats
        if (jobSalary.toLowerCase().includes('lpa') || jobSalary.toLowerCase().includes('lakh')) {
          // Handle LPA format (e.g., "5LPA", "5 LPA")
          const lpaMatch = jobSalary.match(/(\d+(\.\d+)?)\s*(lpa|lakh|lacs?)/i);
          if (lpaMatch) {
            const lpaAmount = parseFloat(lpaMatch[1]);
            jobMonthlySalary = (lpaAmount * 100000) / 12; // Convert LPA to monthly
          }
        } else if (jobSalary.includes('/')) {
          // Handle monthly/quarterly format (e.g., "Rs. 50,000/month", "50000/quarter")
          const amountMatch = jobSalary.match(/(\d+(,\d+)*)/);
          if (amountMatch) {
            const numericAmount = parseFloat(amountMatch[0].replace(/,/g, ''));
            
            if (jobSalary.toLowerCase().includes('/month') || jobSalary.toLowerCase().includes('monthly')) {
              jobMonthlySalary = numericAmount;
            } else if (jobSalary.toLowerCase().includes('/quarter') || jobSalary.toLowerCase().includes('quarterly')) {
              jobMonthlySalary = numericAmount / 3;
            } else if (jobSalary.toLowerCase().includes('/year') || jobSalary.toLowerCase().includes('yearly')) {
              jobMonthlySalary = numericAmount / 12;
            }
          }
        } else {
          // Try to extract any numeric value as monthly
          const numericMatch = jobSalary.match(/\d+/);
          if (numericMatch) {
            jobMonthlySalary = parseFloat(numericMatch[0]);
          }
        }

        // Parse filter values
        const parseFilterSalary = (salaryStr: string): number => {
          if (!salaryStr) return 0;
          
          if (salaryStr.toLowerCase().includes('lpa')) {
            const lpaMatch = salaryStr.match(/(\d+(\.\d+)?)\s*lpa/i);
            if (lpaMatch) {
              const lpaAmount = parseFloat(lpaMatch[1]);
              return (lpaAmount * 100000) / 12;
            }
          } else {
            // Extract numeric value from strings like "Rs. 50,000/month"
            const numericMatch = salaryStr.match(/\d+/);
            if (numericMatch) {
              return parseFloat(numericMatch[0]);
            }
          }
          return 0;
        };

        const minFilterSalary = parseFilterSalary(filters.salaryMin);
        const maxFilterSalary = parseFilterSalary(filters.salaryMax);

        // Apply filters
        if (minFilterSalary > 0 && jobMonthlySalary < minFilterSalary) {
          return false;
        }
        if (maxFilterSalary > 0 && jobMonthlySalary > maxFilterSalary) {
          return false;
        }

      } catch (e) {
        console.error("Error parsing salary:", e, job.salary);
        // If salary parsing fails, include the job if includeNotDisclosed is true
        // You might want to add a flag for this in your filters
        return true;
      }
    }

    // Date filter
    if (filters.dateFrom || filters.dateTo) {
      const jobDate = new Date(job.createdAt);
      if (filters.dateFrom && jobDate < filters.dateFrom) return false;
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setDate(endDate.getDate() + 1); // Include the entire day
        if (jobDate > endDate) return false;
      }
    }

    return true;
  });
};

// Filter applications based on filters
export const filterApplications = (
  applications: JobApplicationView[],
  filters: Filters
): JobApplicationView[] => {
  return applications.filter(app => {
    // Search filter
    if (
      filters.search &&
      !app.job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !app.company.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      // Check skills if they exist
      !(
        app.job.skills &&
        app.job.skills.some(skill =>
          skill.toLowerCase().includes(filters.search.toLowerCase())
        )
      ) &&
      // Check location
      !app.job.location?.toLowerCase().includes(filters.search.toLowerCase()) &&
      // Check employment type
      !app.job.employmentType.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      // If job has no skills or skills is empty, filter it out
      if (!app.job.skills || app.job.skills.length === 0) {
        return false;
      }

      // Check if job has at least one of the required skills
      // Fixed: Don't try to use nested some() on skills
      const hasRequiredSkill = filters.skills.some(requiredSkill =>
        app.job.skills!.some(skill =>
          skill.toLowerCase() === requiredSkill.toLowerCase()
        )
      );

      if (!hasRequiredSkill) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(app.status.id)) {
      return false;
    }

    // Location filter
    if (filters.location.length > 0 && app.job.location && !filters.location.includes(app.job.location)) {
      return false;
    }

    // Employment type filter
    if (filters.employmentType.length > 0 && !filters.employmentType.includes(app.job.employmentType)) {
      return false;
    }

    // // Experience level filter
    // if (filters.experienceLevel.length > 0 && !filters.experienceLevel.includes(app.job.experienceLevel)) {
    //   return false;
    // }

    // Salary filters
    // if (filters.salaryRange && app.job.salary) {
    //   try {
    //     const [minStr, maxStr] = filters.salaryRange.split('-');
    //     const salary = JSON.parse(app.job.salary);
    //     const jobSalaryAvg = (salary.min + salary.max) / 2;

    //     if (maxStr) {
    //       // Regular range like "50000-75000"
    //       const min = parseInt(minStr);
    //       const max = parseInt(maxStr);
    //       if (jobSalaryAvg < min || jobSalaryAvg > max) {
    //         return false;
    //       }
    //     } else if (minStr.endsWith('+')) {
    //       // Range like "200000+"
    //       const min = parseInt(minStr.slice(0, -1));
    //       if (jobSalaryAvg < min) {
    //         return false;
    //       }
    //     }
    //   } catch (e) {
    //     console.error("Error parsing salary:", e);
    //     return false; // Skip this job if salary parsing fails
    //   }
    // }

    // Date filters
    if (filters.dateFrom || filters.dateTo) {
      // Use postedAt if available, otherwise fallback to createdAt
      const appliedDate = new Date(app.job.postedAt || app.job.createdAt);

      if (filters.dateFrom && appliedDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setDate(endDate.getDate() + 1); // Include the entire day
        if (appliedDate > endDate) {
          return false;
        }
      }
    }
    return true;
  });
};

// Formatting helpers
export const formatSalary = (salaryString: string): string => {
  if (!salaryString) return "Not specified";
  try {
    const salary: Salary = JSON.parse(salaryString);
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    }
    if (salary.min) return `From $${salary.min.toLocaleString()}`;
    if (salary.max) return `Up to $${salary.max.toLocaleString()}`;
  } catch (e) {
    console.error("Error parsing salary:", e);
  }
  return "Not specified";
};

export const formatEmploymentType = (type: string) => {
  if (!type) return "Not specified";
  return type.replace("_", " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


export function formatDateddmmyyy(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
