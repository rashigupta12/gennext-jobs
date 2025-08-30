"use client";

import { CheckCircle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";

// Import images with proper typing
import avatar from "../../public/images/avater.png";
import clientImg from "../../public/images/client.png";
import globe from "../../public/images/globe.png";

// Import components
import FeaturedJobs from "@/components/common/featuredJobs";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { useDataFetching, useJobFilters } from "@/components/functions/usedatafetching";
import JobSearchSection from "@/components/homepage/serachbar";
import Link from "next/link";
import { Details } from "@/lib/data";

// Custom hook for job filtering and pagination with improved performance
export default function Home() {
  const {  jobListings,  loading, error, retryCount } =
    useDataFetching();
  const {
    uniqueProfiles,
    paginatedJobs,
    selectedJobs,
    setSelectedJobs,
    showAllProfiles,
    setShowAllProfiles,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useJobFilters(jobListings);

  // Enhanced loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-gennext-DEFAULT border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">
          Loading amazing job opportunities...
        </p>
      </div>
    );
  }

  // Enhanced error state with retry button
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Oops! Something went wrong
          </h2>
          <p className="text-red-500 mb-6">{error}</p>
          <p className="text-gray-600 mb-6">
            We re having trouble connecting to our servers. Please try again.
            {retryCount > 0 && ` (Attempt ${retryCount} of 3)`}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gennext-DEFAULT text-white rounded-md hover:bg-gennext-dark transition-colors focus:outline-none focus:ring-2 focus:ring-gennext-DEFAULT focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <Navbar />

      {/* Hero Section - Updated color theme */}
      <header className="mt-10 flex flex-col items-center justify-between bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-10 md:px-20 md:py-24 transition-all duration-300 md:mt-10 md:flex-row">
        <div className="hidden md:block max-w-lg text-center md:text-left mb-10 md:mb-0">

          <h1 className="text-4xl font-bold text-gray-900 transition-all duration-300 md:text-5xl lg:text-6xl">
            Find The Job That <span className="text-gennext-DEFAULT">Fits</span> Your
            Life
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed md:mt-6">
            Resume-Library is a true performance-based job board. Enjoy custom
            hiring products and access to up to 10,000 new resume registrations
            daily, with no subscriptions or user licenses.
          </p>
        
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/auth/register">
            <button className="px-6 py-3 bg-gennext-dark text-white rounded-lg font-medium hover:bg-gennext-dark transition-colors shadow-md">
              Get Started
            </button>
            </Link>
            <button className="px-6 py-3 bg-white text-gennext-DEFAULT border border-gennext-light rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Learn More
            </button>
          </div>
          
        </div>
        <div className="relative">
          <Image
            src={avatar}
            alt="Happy Candidate"
            width={400}
            height={400}
            className="transition-transform duration-500 hover:scale-105"
            priority
          />
          <div className="absolute left-0 md:left-8 top-32 md:top-40 flex animate-bounce items-center space-x-2 rounded-full bg-white p-3 shadow-lg">
      <Image
        src={clientImg}
        alt="User"
        width={40}
        height={40}
        className="rounded-full"
      />

      {/* Large screen text */}
      <span className="hidden md:inline font-semibold text-gennext-DEFAULT text-sm">
        480+ Happy Candidates
      </span>

      {/* Small screen text with link */}
      <Link
        href="/auth/register"
        className="md:hidden font-semibold  text-sm "
      >
        Job seeker? <span className="text-gennext underline"> Click here</span>
      </Link>
    </div>
        </div>
      </header>

      <JobSearchSection />

      {/* Job Listings Section - Updated color theme */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured <span className="text-gennext-DEFAULT">Job Opportunities</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Handpicked job listings matched to your skills, experience, and
            career goals.
          </p>
        </div>

        {/* Job Profile Filters - Updated color theme */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(showAllProfiles ? uniqueProfiles : uniqueProfiles.slice(0, 6)).map(
            (profile, index) => (
              <button
                key={`${profile}-${index}`}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  selectedJobs === profile
                    ? "bg-gennext-DEFAULT text-white border-gennext-DEFAULT shadow-md"
                    : "border-gray-200 text-gray-700 bg-white hover:text-gennext-DEFAULT hover:border-gennext-light hover:shadow-sm"
                }`}
                onClick={() =>
                  setSelectedJobs(selectedJobs === profile ? null : profile)
                }
              >
                {profile}
                {selectedJobs === profile && <span className="text-lg">×</span>}
              </button>
            )
          )}

          {uniqueProfiles.length > 6 && (
            <button
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white transition-all duration-300 hover:bg-gray-50 hover:shadow-sm"
              onClick={() => setShowAllProfiles(!showAllProfiles)}
            >
              {showAllProfiles ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Job Listings Grid - Updated color theme */}
        <div className="container mx-auto mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => (
                <div
                  key={job.id}
                  className="transform transition-all duration-300 hover:-translate-y-1 flex justify-center"
                >
                  <FeaturedJobs job={job} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No jobs found</h3>
                  <p className="text-gray-500">
                    No jobs match your current filter. Try another category.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Pagination - Updated color theme */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-white text-gray-700 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors mx-1"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex space-x-1 mx-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                    index === currentPage
                      ? "bg-gennext-soft text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(index)}
                  aria-label={`Go to page ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-white text-gray-700 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors mx-1"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* Stats Section - Updated color theme */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-between p-4 md:p-10 lg:flex-row">
          {/* Left Section with World Map and Stats */}
          <div className="relative flex w-full justify-center md:w-1/2 mb-12 lg:mb-0">
            <div className="relative flex h-64 w-64 md:h-80 md:w-80 items-center justify-center rounded-full bg-blue-50">
              <Image
                src={globe}
                alt="World map"
                width={320}
                height={320}
                className="animate-pulse"
              />
            </div>
            {/* Floating Stats with animations */}
            <div className="absolute left-0 md:left-5 top-5 md:top-10 rounded-xl bg-white p-3 shadow-lg animate-fadeIn border border-gray-100">
              <p className="text-xl font-bold text-gennext-DEFAULT">198+</p>
              <p className="text-sm text-gray-500">Countries</p>
            </div>
            <div className="absolute bottom-5 md:bottom-10 left-5 md:left-10 rounded-xl bg-white p-3 shadow-lg animate-fadeIn animation-delay-300 border border-gray-100">
              <p className="text-xl font-bold text-gennext-DEFAULT">1 million+</p>
              <p className="text-sm text-gray-500">Candidates</p>
            </div>
            <div className="absolute bottom-28 md:bottom-40 left-28 md:left-40 rounded-xl bg-white p-3 shadow-lg animate-fadeIn animation-delay-600 border border-gray-100">
              <p className="text-xl font-bold text-gennext-DEFAULT">350k</p>
              <p className="text-sm text-gray-500">Job Search Success</p>
            </div>
          </div>

          {/* Right Section with Text and Features */}
          <div className="w-full md:w-1/2 md:pl-10">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">
              Why Choose <span className="text-gennext-DEFAULT">{Details.name}</span>{" "}
              for Your Next Opportunity?
            </h2>
            <ul className="space-y-5 text-gray-600">
              <li className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <CheckCircle className="text-gennext-DEFAULT w-5 h-5" />
                </div>
                <span>
                  <strong className="text-gray-800">
                    More Than Just Listings
                  </strong>{" "}
                  – We focus on finding the right job match for you.
                </span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <CheckCircle className="text-gennext-DEFAULT w-5 h-5" />
                </div>
                <span>
                  <strong className="text-gray-800">
                    Tailored Opportunities
                  </strong>{" "}
                  – We connect you with roles that fit your expertise.
                </span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <CheckCircle className="text-gennext-DEFAULT w-5 h-5" />
                </div>
                <span>
                  <strong className="text-gray-800">
                    Remote Work for Women
                  </strong>{" "}
                  – Special opportunities for women looking for flexible remote finance jobs.
                </span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <CheckCircle className="text-gennext-DEFAULT w-5 h-5" />
                </div>
                <span>
                  <strong className="text-gray-800">
                    Skill & Career-Aligned Jobs
                  </strong>{" "}
                  – We match you with employers who value your skills and goals.
                </span>
              </li>
            </ul>
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl border-l-4 border-gennext-DEFAULT">
              <p className="font-semibold text-gray-700">
                🚀 Join {Details.name} today &{" "}
                <span className="text-gennext-DEFAULT">#FindYourMatch!</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Add custom styles for animations and scrollbar hiding */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}