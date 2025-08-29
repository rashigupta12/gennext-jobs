//serachResult/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import JobCard from "@/components/common/jobSerach";

interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  employmentType: string;
  salary?: string | { min: number; max: number };
  postedAt: string;
  isFeatured?: boolean;
}

interface Company {
  id: string;
  name: string;
  logo?: string | null;
  industry?: string | null;
}

interface FilterOptions {
  employmentTypes: { value: string; label: string }[];
  locations: string[];
  experienceLevels: { value: string; label: string }[];
  industries: string[];
  categories: { id: string; name: string }[];
  subcategories: { id: string; name: string; categoryId: string }[];
  datePosted: string[];
  salaryRanges: string[];
}

const SearchResultsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<{
    jobs: Job[];
    companies: Company[];
  }>({ jobs: [], companies: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );

  // Filter options
  // In your frontend
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    employmentTypes: [
      { value: "FULL_TIME", label: "Full Time" },
      { value: "PART_TIME", label: "Part Time" },
      { value: "CONTRACT", label: "Contract" },
      { value: "INTERNSHIP", label: "Internship" },
      { value: "FREELANCE", label: "Freelance" },
    ],
    // ... other filter options
    locations: [
      "Remote",
      "New York",
      "San Francisco",
      "London",
      "Berlin",
      "Tokyo",
    ],
    experienceLevels: [
      { value: "0-1", label: "Entry Level (0-1 years)" },
      { value: "1-3", label: "Junior (1-3 years)" },
      { value: "3-5", label: "Mid-Level (3-5 years)" },
      { value: "5-10", label: "Senior (5-10 years)" },
      { value: "10+", label: "Lead/Executive (10+ years)" },
    ],
    categories: [],
    subcategories: [],
    salaryRanges: [
      "$0-$50k",
      "$50k-$100k",
      "$100k-$150k",
      "$150k-$200k",
      "$200k+",
    ],
    datePosted: [
      "Last 24 hours",
      "Last 7 days",
      "Last 14 days",
      "Last 30 days",
    ],
    industries: [],
  });

  // Fetch categories and subcategories on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // These endpoints would need to be implemented in your API
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setFilterOptions((prev) => ({
            ...prev,
            categories: categoriesData,
          }));
        }

        const subcategoriesResponse = await fetch("/api/subCategories");
        if (subcategoriesResponse.ok) {
          const subcategoriesData = await subcategoriesResponse.json();
          setFilterOptions((prev) => ({
            ...prev,
            subcategories: subcategoriesData,
          }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use the exact parameter names that your API expects
        // Convert the current URL parameters to what your API expects
        const apiParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
          apiParams.set(key, value);
        });

        const response = await fetch(`/api/search?${apiParams.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setError("An error occurred while fetching results");
      } finally {
        setIsLoading(false);
      }
    };

    // Parse applied filters from URL
    const newAppliedFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "query") {
        newAppliedFilters[key] = value;
      }
    });
    setAppliedFilters(newAppliedFilters);

    fetchSearchResults();
  }, [searchParams]);

  const applyFilter = (filterType: string, value: string) => {
    console.log(`Applying filter: ${filterType} = ${value}`);
    const params = new URLSearchParams(searchParams.toString());

    if (params.get(filterType) === value) {
      console.log(`Removing filter: ${filterType}`);
      params.delete(filterType);
    } else {
      console.log(`Setting filter: ${filterType} = ${value}`);
      params.set(filterType, value);
    }

    console.log(`New params: ${params.toString()}`);
    router.push(`/searchResult?${params.toString()}`);
  };

  const isFilterActive = (filterType: string, value: string) => {
    const isActive = appliedFilters[filterType] === value;
    console.log(`Checking if ${filterType}=${value} is active: ${isActive}`);
    return isActive;
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const query = searchParams.get("query");
    if (query) {
      params.set("query", query);
    }
    router.push(`/searchResult?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                {Object.keys(appliedFilters).length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Filter Sections */}
              <div className="space-y-6">
                {/* Employment Type Filter */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Employment Type
                  </h3>
                  <div className="space-y-2">
                    {filterOptions.employmentTypes.map((type) => (
                      <div key={type.value} className="flex items-center">
                        <input
                          id={`type-${type.value}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isFilterActive("employmentType", type.value)}
                          onChange={() =>
                            applyFilter("employmentType", type.value)
                          }
                        />
                        <label
                          htmlFor={`type-${type.value}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Location</h3>
                  <div className="space-y-2">
                    {filterOptions.locations.map((location) => (
                      <div key={location} className="flex items-center">
                        <input
                          id={`location-${location}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isFilterActive("location", location)}
                          onChange={() => applyFilter("location", location)}
                        />
                        <label
                          htmlFor={`location-${location}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Posted Filter */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Date Posted
                  </h3>
                  <div className="space-y-2">
                    {filterOptions.datePosted.map((option) => (
                      <div key={option} className="flex items-center">
                        <input
                          id={`date-${option}`}
                          type="radio"
                          name="datePosted"
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isFilterActive("datePosted", option)}
                          onChange={() => applyFilter("datePosted", option)}
                        />
                        <label
                          htmlFor={`date-${option}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salary Range Filter */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Salary Range
                  </h3>
                  <div className="space-y-2">
                    {filterOptions.salaryRanges.map((range) => (
                      <div key={range} className="flex items-center">
                        <input
                          id={`salary-${range}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isFilterActive("salaryRange", range)}
                          onChange={() => applyFilter("salaryRange", range)}
                        />
                        <label
                          htmlFor={`salary-${range}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {range}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industry Filter (for companies) */}
                {/* {activeTab === "companies" && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Industry</h3>
                    <div className="space-y-2">
                      {filterOptions.employmentTypes.map((type) => (
                        <div key={type.value} className="flex items-center">
                          <input
                            id={`type-${type.value}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isFilterActive(
                              "employmentType",
                              type.value
                            )}
                            onChange={() =>
                              applyFilter("employmentType", type.value)
                            }
                          />
                          <label
                            htmlFor={`type-${type.value}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Search Summary & Tabs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Search Results
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {searchResults.jobs.length + searchResults.companies.length}{" "}
                    results found for &quot;{searchParams.get("query") || ""}
                    &quot;
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex mt-4 sm:mt-0 space-x-4">
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "jobs"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Jobs ({searchResults.jobs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("companies")}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "companies"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Companies ({searchResults.companies.length})
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
                  <p>{error}</p>
                </div>
              )}

              {/* Jobs Content */}
              {activeTab === "jobs" &&
                !isLoading &&
                searchResults.jobs.length > 0 && (
                  <div className="space-y-4">
                    {searchResults.jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        location={job.location}
                        employmentType={job.employmentType}
                        salary={job.salary}
                        postedAt={job.postedAt}
                        isFeatured={job.isFeatured}
                      />
                    ))}
                  </div>
                )}

              {/* Companies Content */}
              {/* {activeTab === "companies" &&
                !isLoading &&
                searchResults.companies.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.companies.map((company) => (
                      <div
                        key={company.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {company.logo ? (
                              <Image
                                src={company.logo}
                                alt={company.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-400">
                                {company.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 text-lg">
                              {company.name}
                            </h3>
                            {company.industry && (
                              <div className="flex items-center mt-1">
                                <svg
                                  className="h-4 w-4 mr-1 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  ></path>
                                </svg>
                                <span className="text-sm text-gray-500">
                                  {company.industry}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                          <a
                            href={`/companies/${company.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                          >
                            View Profile
                            <svg
                              className="w-4 h-4 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )} */}

              {/* No Results Message */}
              {((activeTab === "jobs" && searchResults.jobs.length === 0) ||
                (activeTab === "companies" &&
                  searchResults.companies.length === 0)) &&
                !isLoading && (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No results found
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Try adjusting your search or filter criteria to find what
                      you&apos;re looking for.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
