/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import FeaturedJobs from "@/components/common/featuredJobs";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

interface Company {
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

interface Job {
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


const fetchAPI = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return null;
  }
};

const Jobs = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subcategorySlug = params.slug as string;
  const companyIdFilter = searchParams.get("companyId");

  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!subcategorySlug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Subcategory Details
        const subcategoryData = await fetchAPI(`/api/subCategories?slug=${subcategorySlug}`);
        if (!subcategoryData || !subcategoryData.subcategories) {
          throw new Error("Failed to fetch subcategory details");
        }

        const subcategory = subcategoryData.subcategories.find(
          (sub: { slug: string }) => sub.slug === subcategorySlug
        );
        if (!subcategory) {
          throw new Error("Subcategory not found");
        }

        setSubcategoryId(subcategory.id);

        // Fetch Jobs Data
        const jobsData = await fetchAPI(`/api/job-listing?subcategoryId=${subcategory.id}`);
        if (!jobsData || !jobsData.jobListings) {
          throw new Error("Failed to fetch jobs");
        }

        const jobListings: Job[] = jobsData.jobListings;

        // Fetch Company Details for each job
        const jobsWithCompanies = await Promise.all(jobListings.map(async (job) => {
          try {
            const companyResponse = await fetchAPI(`/api/companies?id=${job.companyId}`);
            if (companyResponse && companyResponse.companies && companyResponse.companies.length > 0) {
              return {
                ...job,
                company: companyResponse.companies[0]
              };
            }
            return job;
          } catch (companyError) {
            console.error(`Failed to fetch company for job ${job.id}:`, companyError);
            return job;
          }
        }));

        setJobs(jobsWithCompanies);

        // Apply company filter if exists
        if (companyIdFilter) {
          const filtered = jobsWithCompanies.filter(job => job.companyId === companyIdFilter);
          setFilteredJobs(filtered);
          setSelectedCompany(filtered[0]?.company || null);
        } else {
          setFilteredJobs(jobsWithCompanies);
          setSelectedCompany(null);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subcategorySlug, companyIdFilter]);

  const resetFilter = () => {
    router.push(`/jobs/${subcategorySlug}`);
  };

  return (
    <div>
      <div className="min-h-screen w-full bg-gray-50 overflow-hidden">
        <Navbar />
        <div className="container mx-auto px-4 py-16 mt-12">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
            {selectedCompany ? `Jobs at ${selectedCompany.name || 'Company'}` : `Jobs for ${subcategorySlug.replace("-", " ")}`}
          </h1>

          {selectedCompany && (
            <div className="flex justify-center mb-6">
              <button
                onClick={resetFilter}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              >
                Show All Jobs
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-center text-gray-600">Loading jobs...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-center text-gray-600">No jobs found for this subcategory.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredJobs.map((job) => (
                <FeaturedJobs key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;