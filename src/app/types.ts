/* eslint-disable @typescript-eslint/no-explicit-any */
// Type definitions
export interface Company {
  id: string;
  name: string;
  logo: string;
  website: string;
  about: string;
  address: string;
  industry: string;
  rating: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  company: Company;
  location: string;
  employmentType: string;
  duration: string;
  salary: string;
  highlights: string[];
  slug: string;
  categoryId: string;
  subcategoryId: string;
  startDate: string;
  endDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
  createdAt: string;
  updatedAt: string;
  applicantsCount: number;
  openings: number;
  postedAt: string;
  expiresAt: string;
  qualifications: string[];
  skills: string[];
  responsibilities: string[];
  education: string[];
  experience: string[];
  certifications: string[];
  languages: string[];
  workHours: string;
  role: string;
  department: string;
  isFeatured: boolean;
  isActive: boolean;
  [key: string]: any; // Add this line to allow any additional properties
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
}