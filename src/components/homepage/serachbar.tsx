"use client";

import { Search } from "lucide-react";
import React, { useState } from "react";

const JobSearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      const normalizedQuery = searchQuery.replace(/\s+/g, " ").trim(); // Normalize spaces
      params.append("query", normalizedQuery);

      // Redirect to jobs page with search parameters
      window.location.href = `/jobs?${params.toString()}`;
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto -mt-28 relative z-20 px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Find your perfect career opportunity
          </h3>

          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Skills/Designations/Companies Input */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Skills / designations / companies / employment type / Location"
                  className="pl-10 w-full py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 hover:bg-white transition-colors duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

{/* Search Button */}
<button
  type="submit"
  className={`w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 ${
    isLoading ? "opacity-70 cursor-not-allowed" : ""
  }`}
  disabled={isLoading}
>
  {isLoading ? (
    <span className="flex items-center justify-center">
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Searching...
    </span>
  ) : (
    <Search className="h-5 w-5" />
  )}
</button>

            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobSearchSection;
