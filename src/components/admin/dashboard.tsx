/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars*/
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Briefcase,
  Users,
  ChevronLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  BarChart2,
  Clock,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CompanyCreationForm from "./companyCreation";

// Types definition
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


interface Recruiter {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  position?: string;
}

interface JobListing {
  id: string;
  title: string;
  companyId: string;
  userId: string; // Recruiter's ID
  location?: string;
  salary?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  employmentType: string;
  isActive: boolean;
  postedAt: string;
  expiresAt?: string;
  applicantsCount: number;
}


const AdminDashboard = () => {
  const { data: session } = useSession();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [recruiters, setRecruiters] = useState<{ [key: string]: Recruiter }>({});
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCompanyCreation, setShowCompanyCreation] = useState(false);

  // Fetch company data for the logged-in admin
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (!session?.user?.id) return;
      console.log("Fetching user company data...");

      try {
        console.log("Fetching company data for user ID:", session.user.id);
        // First, fetch the company associated with the user
        const companyResponse = await fetch(
          `/api/companies?userid=${session.user.id}`
        );
        console.log("Company response:", companyResponse);

        if (!companyResponse.ok) {
          throw new Error("Failed to fetch company data");
        }

        const companyData = await companyResponse.json();
        console.log("Company data:", companyData);

        if (companyData.companies.length === 0) {
          setIsLoading(false);
          return;
        }

        const userCompany = companyData.companies[0];
        setCompany(userCompany);
        console.log("User company:", userCompany);

        // Then, fetch job listings for this company
        await fetchJobListings(userCompany.id);
      } catch (error) {
        console.error("Error fetching company data:", error);
        alert("Failed to load company data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCompany();
  }, [session]);

  // Fetch job listings for a company
  const fetchJobListings = async (companyId: string) => {
    try {
      const jobListingsResponse = await fetch(
        `/api/job-listing?companyId=${companyId}`
      );
  
      if (!jobListingsResponse.ok) {
        throw new Error("Failed to fetch job listings");
      }
  
      const jobListingsData = await jobListingsResponse.json();
      
      // Ensure jobListings is an array before setting it
      if (Array.isArray(jobListingsData.jobListings)) {
        setJobs(jobListingsData.jobListings);
        
        // Type-safe approach to extract recruiter IDs
        const recruiterIds: string[] = [];
        
        // Loop through jobs and collect valid userIds
        jobListingsData.jobListings.forEach((job: any) => {
          if (job && typeof job.userId === 'string') {
            recruiterIds.push(job.userId);
          }
        });
        
        // Create an array of unique recruiter IDs
        const uniqueRecruiterIds: string[] = Array.from(new Set(recruiterIds));
        
        console.log("Unique recruiter IDs:", uniqueRecruiterIds);
        
        if (uniqueRecruiterIds.length > 0) {
          await fetchRecruiters(uniqueRecruiterIds);
        } else {
          console.log("No valid recruiter IDs found");
        }
      } else {
        console.error("Expected jobListings to be an array, got:", jobListingsData);
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching job listings:", error);
      alert("Failed to load job listings");
    }
  };

  // Fetch recruiter details
  const fetchRecruiters = async (userIds: string[]) => {
    try {
      // Fetch multiple users in one request if possible
      const recruiterPromises = userIds.map(id => 
        fetch(`/api/users?Id=${id}`).then(res => res.json())
      );
      
      const recruiterData = await Promise.all(recruiterPromises);
      console.log("Recruiter data:", recruiterData);
      
      // Create a new recruiters map to store valid recruiter data
      const recruitersMap: { [key: string]: Recruiter } = {};
      
      // Define a type guard to check if an object has the required structure
      const isUserResponse = (obj: any): obj is { 
        success: boolean; 
        data: { 
          id: string; 
          name: string; 
          email: string; 
          image?: string; 
          avatar?: string; 
          position?: string; 
          role?: string;
        }; 
        message: string 
      } => {
        return (
          obj &&
          typeof obj === 'object' &&
          'success' in obj &&
          'data' in obj &&
          obj.data &&
          typeof obj.data === 'object' &&
          'id' in obj.data
        );
      };
      
      // Process each result with proper type checking
      recruiterData.forEach((result: any) => {
        if (isUserResponse(result) && result.success) {
          const userData = result.data;
          recruitersMap[userData.id] = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.image || userData.avatar,
            position: userData.position || userData.role
          };
          console.log(`Added recruiter ${userData.name} with ID ${userData.id}`);
        } else {
          console.log("Invalid or unexpected response format:", result);
        }
      });
      
      console.log("Processed recruiters map:", recruitersMap);
      setRecruiters(recruitersMap);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recruiters[job.userId]?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format employment type to be more readable
  const formatEmploymentType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Handle view job details
  const handleViewJob = (job: JobListing) => {
    setSelectedJob(job);
  };

  // Handle back button in job details view
  const handleBackToJobs = () => {
    setSelectedJob(null);
  };

  // Handle company creation
  const handleCreateCompany = () => {
    setShowCompanyCreation(true);
  };

  // Handle canceling company creation
  const handleCancelCompanyCreation = () => {
    setShowCompanyCreation(false);
  };

  // Company details section
  const CompanyDetails = () => {
    if (!company) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {company.logo ? (
                <div className="h-16 w-16 rounded-md overflow-hidden">
                  <Link href={company.website} target="_blank" rel="noopener noreferrer">
                  <Image src={company.logo} alt={company.name} width={64} height={64} />
                  </Link>
                </div>
              ) : (
                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                  <Building className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {company.name}
                  {company.isVerified && (
                    <Badge variant="outline" className="ml-2">
                      Verified
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{company.industry}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Company details content */}
        </CardContent>
      </Card>
    );
  };

  // Job listings table
  const JobListingsTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Job Listings</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            {jobs.length} job{jobs.length === 1 ? "" : "s"} posted by this company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No jobs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {recruiters[job.userId]?.avatar ? (
                            <div className="h-6 w-6 rounded-full overflow-hidden">
                              <Image 
                                src={recruiters[job.userId].avatar || ""} 
                                alt={recruiters[job.userId]?.name || ""}
                                width={24}
                                height={24}
                              />
                            </div>
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          {recruiters[job.userId]?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatEmploymentType(job.employmentType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.location || "Remote"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(job.postedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            job.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {job.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {job.applicantsCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewJob(job)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Job details view (70/30 split)
  const JobDetailsView = () => {
    if (!selectedJob) return null;
    
    const recruiter = recruiters[selectedJob.userId];
    
    return (
      <div className="flex flex-col h-full">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit mb-4"
          onClick={handleBackToJobs}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Jobs
        </Button>
        
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* 70% - Job Details */}
          <Card className="flex-grow lg:w-[70%]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedJob.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {formatEmploymentType(selectedJob.employmentType)}
                    </Badge>
                    {selectedJob.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedJob.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Posted: {formatDate(selectedJob.postedAt)}
                    </span>
                  </CardDescription>
                </div>
                <Badge
                  className={
                    selectedJob.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {selectedJob.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedJob.salary && (
                <div className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span>{selectedJob.salary}</span>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {selectedJob.description || "No description provided"}
                </p>
              </div>
              
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="text-muted-foreground">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index} className="text-muted-foreground">{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedJob.expiresAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {formatDate(selectedJob.expiresAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 30% - Sidebar */}
          <div className="lg:w-[30%] space-y-6">
            {/* Recruiter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recruiter</CardTitle>
              </CardHeader>
              <CardContent>
                {recruiter ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-muted mb-4">
                      {recruiter.avatar ? (
                        <Image 
                          src={recruiter.avatar} 
                          alt={recruiter.name} 
                          width={64} 
                          height={64}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold">{recruiter.name}</h3>
                    {recruiter.position && (
                      <p className="text-sm text-muted-foreground">{recruiter.position}</p>
                    )}
                    <p className="text-sm mt-2">{recruiter.email}</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Message Recruiter
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Recruiter information not available
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Application Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Applicants</span>
                  <Badge variant="outline">{selectedJob.applicantsCount}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Reviewed</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "68%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Shortlisted</span>
                    <span>35%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: "35%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rejected</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: "15%" }} />
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <BarChart2 className="h-4 w-4 mr-2" /> View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Edit Job
                </Button>
                <Button variant={selectedJob.isActive ? "destructive" : "outline"} className="w-full justify-start">
                  {selectedJob.isActive ? "Deactivate Job" : "Activate Job"}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Applicants
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Check if there's no company and not showing company creation form
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>

        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="mb-4 p-2 border-b">
                <Skeleton className="h-6 w-full mb-2" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If showing company creation form, render it
  if (showCompanyCreation) {
    return <CompanyCreationForm onCancel={handleCancelCompanyCreation} />;
  }

  // If no company found and not loading, show the "No Company Found" card
  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle className="text-xl">No Company Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              You don&apos;t have a company associated with your account.
            </p>
            <Button onClick={handleCreateCompany} className="w-full">
              Create Company
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard view with company details and job listings
  return (
    <div className="container mx-auto px-4 py-8">
      {selectedJob ? (
        <JobDetailsView />
      ) : (
        <>
          <CompanyDetails />
          <JobListingsTable />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;