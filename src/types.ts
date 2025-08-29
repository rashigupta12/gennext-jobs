/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date;
  password: string;
  mobile?: string;
  profile?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
}

export interface Resume {
  id: string;
  userId: string;
  resumeUrl: string;
  experience?: string;
  skills?: string;
  education?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  createdBy: string;
  recruiter: string[];
  name: string;
  logo?: string;
  website?: string;
  about?: string;
  address?: string;
  industry?: string;
  rating?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobListing {
  job: any;
  company: any;
  experienceLevel(experienceLevel: any): unknown;
  id: string;
  userId: string;
  title: string;
  slug?: string;
  categoryId: string;
  subcategoryId?: string;
  companyId: string;
  duration?: string;
  salary?: string;
  location?: string;
  startDate?: string;
  applicantsCount: number;
  openings: number;
  description?: string;
  highlights?: string[];
  qualifications?: string[];
  skills?: string[];
  role?: string;
  department?: string;
  employmentType: string;
  education?: string;
  isFeatured: boolean;
  isActive: boolean;
  postedAt: Date;
  expiresAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  resumeId: string;
  coverLetter?: string;
  status?: string;
  appliedAt: Date;
  updatedAt: Date;
}

export interface ApplicationStatus {
  id: string;
  name: string;
  color: string;
}

export interface JobApplicationView {
  application: JobApplication;
  job: JobListing;
  company: Company;
  category: Category;
  subcategory?: Subcategory;
  status: ApplicationStatus;
  resume: Resume;
}

export interface Filters {
  skills: string[];
  
  salaryMin: string | number | readonly string[] | undefined;
  salaryMax: string | number | readonly string[] | undefined;
  search: string;
  status: string[];
  location: string[];
  employmentType: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  salaryRange: string;

}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  { id: "pending", name: "Pending", color: "#F59E0B" },
  { id: "reviewing", name: "Reviewing", color: "#3B82F6" },
  { id: "interview", name: "Interview", color: "#10B981" },
  { id: "offered", name: "Offered", color: "#6366F1" },
  { id: "rejected", name: "Rejected", color: "#EF4444" },
  { id: "withdrawn", name: "Withdrawn", color: "#6B7280" },
  { id: "hired", name: "Hired", color: "#059669" },
];

// Define all possible job types
export const ALL_JOB_TYPES = [
 "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"
] as const;

// Optional: Create a type for employment types
export type EmploymentType = typeof ALL_JOB_TYPES[number];
export type PartialJobApplicationView = Partial<JobApplicationView>;