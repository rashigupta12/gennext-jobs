/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Application = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { data: session, status } = useSession();
  
  interface Job {
    id: string;
    title: string;
    userId: string;
  }
  
  interface Application {
    id: string;
    user?: {
      name: string;
    };
    job?: {
      title: string;
      id: string;
    };
    appliedAt: string;
    status: string;
    resume?: {
      resumeUrl: string;
    };
  }

  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // First fetch jobs belonging to the current recruiter from session
  useEffect(() => {
    const fetchRecruiterJobs = async () => {
      // Wait until session is loaded
      if (status === "loading") return;
      
      // Check if user is authenticated
      if (status === "unauthenticated") {
        setError("You must be logged in to view applications");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get the recruiter ID from the session
        const recruiterId = session?.user?.id;
        
        if (!recruiterId) {
          throw new Error("Recruiter information not found in session");
        }
        
        // Fetch jobs for this recruiter
        const response = await fetch(`/api/job-listing?userId=${recruiterId}`);

        
        if (!response.ok) {
          throw new Error("Failed to fetch recruiter's jobs");
        }
        
        const data = await response.json();
        console.log("Recruiter Jobs:", data.jobListings);
        setRecruiterJobs(data.jobListings);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching jobs");
        }
        console.error("Error fetching recruiter jobs:", err);
        setLoading(false);
      }
    };
    
    fetchRecruiterJobs();
  }, [session, status]);

  // Then fetch applications for those jobs or for a specific job if jobId is provided
  useEffect(() => {
    const fetchApplications = async () => {
      // If session is still loading, wait
      if (status === "loading") return;
      
      // If jobs haven't been loaded yet and no specific jobId is provided, wait
      if (recruiterJobs.length === 0 && !jobId) return;
      
      try {
        setLoading(true);
        
        let url;
        if (jobId) {
          // If a specific job ID is provided in the URL, verify it belongs to this recruiter
          const isRecruiterJob = recruiterJobs.some(job => job.id === jobId);
          
          if (!isRecruiterJob && recruiterJobs.length > 0) {
            throw new Error("You don't have permission to view applications for this job");
          }
          
          url = `/api/application?jobId=${jobId}`;
        } else {
          // Otherwise, fetch applications for all jobs belonging to the recruiter
          const jobIds = recruiterJobs.map(job => job.id);
          
          if (jobIds.length === 0) {
            setApplications([]);
            setLoading(false);
            return;
          }
          
           url = `/api/application?jobIds=${jobIds.join(',')}`;
          console.log("Fetching applications for job IDs:", jobIds);

        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const data = await response.json();

        console.log("Applications:", data);
        setApplications(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching applications");
        }
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [recruiterJobs, jobId, status]);

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color;
    switch (status?.toUpperCase()) {
      case "PENDING":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "SHORTLISTED":
        color = "bg-blue-100 text-blue-800";
        break;
      case "REJECTED":
        color = "bg-red-100 text-red-800";
        break;
      case "HIRED":
        color = "bg-green-100 text-green-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }
    return <Badge className={color}>{status}</Badge>;
  };
  
  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = (resumeUrl: string) => {
    console.log("Downloading resume for application ID:", resumeUrl);
    const fileUrl = resumeUrl || "https://example.com/default-resume.pdf"; // Fallback URL
    
    // Open the file in a new tab instead of downloading it
    window.open(fileUrl, '_blank');
  };

  // Show loading state while session is loading
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading applications...
      </div>
    );
  }


  // Show error if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="text-red-500 p-4">
        You must be logged in to view applications
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold mb-2">No Applications Found</h2>
        <p className="text-gray-500">
          {jobId
            ? "No applications found for this job posting."
            : recruiterJobs.length === 0
            ? "You haven't posted any jobs yet."
            : "No applications found for your job postings."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {jobId
            ? `Job Applications (${applications.length})`
            : `My Job Applications (${applications.length})`}
        </h2>
        {jobId && (
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = "/dashboard/recruiter/applications")
            }
          >
            View All Applications
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">
                  {application.user?.name || "Unknown"}
                </TableCell>
                <TableCell>{application.job?.title || "Unknown Job"}</TableCell>
                <TableCell>{formatDate(application.appliedAt)}</TableCell>
                <TableCell>{renderStatusBadge(application.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                  <Button
  size="sm"
  variant="outline"
  onClick={() => window.open(application.resume?.resumeUrl || "https://example.com/default-resume.pdf", '_blank')}
>
  <Download className="h-4 w-4 mr-1" /> Resume
</Button>
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/recruiter/applications/${application.id}`}
                    >
                      View Details
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Application;