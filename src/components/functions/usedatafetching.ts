'use client'
import { CategoryType, Job } from "@/app/types";
import { Company } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useDataFetching() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobListings, setJobListings] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel data fetching with timeout
      const fetchWithTimeout = async (url: string, timeout = 8000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      const [categoriesResponse, companiesResponse, jobListingsResponse] =
        await Promise.all([
          fetchWithTimeout("/api/categories"),
          fetchWithTimeout("/api/companies"),
          fetchWithTimeout("/api/job-listing"),
        ]);

      // Check responses
      if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
      if (!companiesResponse.ok) throw new Error("Failed to fetch companies");
      if (!jobListingsResponse.ok)
        throw new Error("Failed to fetch job listings");

      // Parse responses
      const categoriesData = await categoriesResponse.json();
      const companiesData = await companiesResponse.json();
      const jobListingsData = await jobListingsResponse.json();

      // Set state with fetched data
      setCategories(categoriesData.categories);
      setCompanies(companiesData.companies);

      // Merge company data with job listings
      const enrichedJobListings = jobListingsData.jobListings.map(
        (job: Job) => ({
          ...job,
          company:
            companiesData.companies.find(
              (c: Company) => c.id === job.companyId
            ) || null,
        })
      );

      setJobListings(enrichedJobListings);
    } catch (err) {
      console.error("Data fetching error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      // Increment retry count
      setRetryCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-retry on error (max 3 attempts)
  useEffect(() => {
    if (error && retryCount < 3) {
      const retryTimeout = setTimeout(() => {
        fetchData();
      }, 3000); // Wait 3 seconds before retrying

      return () => clearTimeout(retryTimeout);
    }
  }, [error, retryCount, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { companies, jobListings, categories, loading, error, retryCount };
}


export function useJobFilters(jobListings: Job[]) {
  const [selectedJobs, setSelectedJobs] = useState<string | null>(null);
  const [showAllProfiles, setShowAllProfiles] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Responsive jobs per page with better breakpoints
  const jobsPerPage = useMemo(() => {
    if (windowWidth < 640) {
      return 4; // Mobile
    } else if (windowWidth < 1024) {
      return 6; // Tablet
    } else {
      return 6; // Desktop
    }
  }, [windowWidth]);

  // Throttled resize handler for better performance
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);

      return () => clearTimeout(timeoutId);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Unique job profiles with memoization
  const uniqueProfiles = useMemo(() => {
    return [...new Set(jobListings.map((job) => job.title))].sort();
  }, [jobListings]);

  // Filter jobs based on selected profile with memoization
  const filteredJobs = useMemo(() => {
    return selectedJobs
      ? jobListings.filter((job) => job.title === selectedJobs)
      : jobListings;
  }, [selectedJobs, jobListings]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Paginated jobs with memoization
  const paginatedJobs = useMemo(() => {
    const start = currentPage * jobsPerPage;
    const end = start + jobsPerPage;
    return filteredJobs.slice(start, end);
  }, [filteredJobs, currentPage, jobsPerPage]);

  // Reset to first page when filters change or screen size changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedJobs, jobsPerPage]);

  return {
    uniqueProfiles,
    filteredJobs,
    paginatedJobs,
    selectedJobs,
    setSelectedJobs,
    showAllProfiles,
    setShowAllProfiles,
    currentPage,
    setCurrentPage,
    totalPages,
    jobsPerPage,
  };
}