/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Footer from "@/components/common/Footer";
import JobInfo from "@/components/common/jobDetails";
import Navbar from "@/components/common/Navbar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

interface JobDetails {
  id: string;
  title: string;
  companyId: string;
  company: Company;
  location: string;
  employmentType: string;
  salary: string;
  duration: string;
  description: string;
  highlights: string[];
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
  openings: number;
  applicantsCount: number;
  postedAt: string;
  expiresAt: string;
  isFeatured: boolean;
  isActive: boolean;
  [key: string]: any; // Allow any additional properties
}

const JobDetailsPage = () => {
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  const jobId = params.id as string;
  console.log("Job ID:", jobId);
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        const jobResponse = await fetch(`/api/job-listing?jobIds=${jobId}`);
        if (!jobResponse.ok) throw new Error("Failed to fetch job details");

        const jobData = await jobResponse.json();

        console.log("Job Data:", jobData);
        
        const job = jobData.jobListings[0];
        
        if (!job) throw new Error("Job not found");

        // Fetch company details if not included in job data
        if (!job.company && job.companyId) {
          const companyResponse = await fetch(`/api/companies?id=${job.companyId}`);
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            console.log("Company Data:", companyData);
            job.company = companyData.companies[0];
          }
          
        }

        setJobDetails({ ...job });
        console.log("Job Details:", job);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // const handleApplyClick = () => {
  //   if (!session || session.user.role !== "USER") {
  //     alert("You can't apply for this job.");
  //     return;
  //   }
  
  //   if (jobDetails) {
  //     window.location.href = `/jobs/apply?id=${jobDetails.id}&title=${encodeURIComponent(jobDetails.title)}`;
  //   }
  // };
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-10 mt-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading Job Details...</p>
            </div>
          </div>
        ) : error || !jobDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                Job Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                {error ||
                  "The job you're looking for doesn't exist or has been removed."}
              </p>
              <button
                onClick={() => (window.location.href = "/jobs")}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Back to Jobs
              </button>
            </div>
          </div>
        ) : (
          <JobInfo jobId={jobId} jobDetails={jobDetails} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default JobDetailsPage;