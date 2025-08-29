"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  // Edit,
  Eye,
  Globe,
  MapPin,
  MoreHorizontal,
  Star,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Job listing type definition
interface JobListing {
  id: string;
  title: string;
  slug: string;
  category: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  company: {
    id: string;
    name: string;
  };
  duration?: string;
  salary?: string;
  location?: string;
  startDate?: string;
  openings: number;
  description?: string;
  highlights?: string[];
  qualifications?: string[];
  skills?: string[];
  role?: string;
  department?: string;
  employmentType:
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "INTERNSHIP"
    | "FREELANCE";
  education?: string;
  isFeatured: boolean;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert employment type to readable text
const employmentTypeLabels = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
};

// Format date to readable string
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const JobListingDashboard: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // State for job listings and selected job - Initialize as empty array
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Fetch job listings
  const fetchJobListings = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/job-listing?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch job listings");
      }

      const data = await response.json();
      console.log("Fetched job listings:", data.jobListings);

      // Ensure data is an array before setting state
      if (Array.isArray(data.jobListings)) {
        setJobListings(data.jobListings);
      } else {
        // If API returns non-array, initialize as empty array
        console.error("API did not return an array for job listings:", data);
        setJobListings([]);
        setError("Received invalid data format from server");
      }
    } catch (err) {
      console.error("Error fetching job listings:", err);
      setError("Failed to load job listings. Please try again.");
      // Ensure we set an empty array on error
      setJobListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch job listings on component mount
  useEffect(() => {
    if (userId) {
      fetchJobListings();
    }
  }, [userId]);

  // Handle job selection (with mobile responsiveness)
  const handleJobSelection = (job: JobListing) => {
    setSelectedJob(job);
    // On mobile, show the sidebar when a job is selected
    if (window.innerWidth < 1024) {
      setShowMobileSidebar(true);
    }
  };

  // Close mobile sidebar
  const closeMobileSidebar = () => {
    setShowMobileSidebar(false);
    setSelectedJob(null);
  };

  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const response = await fetch(`/api/job-listing?id=${jobToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job listing");
      }

      // Remove deleted job from state
      setJobListings((prev) => prev.filter((job) => job.id !== jobToDelete));

      // If the deleted job was selected, clear selection
      if (selectedJob?.id === jobToDelete) {
        setSelectedJob(null);
        setShowMobileSidebar(false);
      }

      // Close dialog
      setShowDeleteDialog(false);
      setJobToDelete(null);
    } catch (err) {
      console.error("Error deleting job:", err);
      setError("Failed to delete job listing. Please try again.");
    }
  };

  // Open delete confirmation dialog
  const confirmDelete = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteDialog(true);
  };

  // Navigate to edit page
  // const navigateToEdit = (jobId: string) => {
  //   window.location.href = `/job-listings/edit/${jobId}`;
  // };

  // Filter job listings based on search term and status
  // Use a defensive approach when filtering
  const filteredJobs = Array.isArray(jobListings)
    ? jobListings.filter((job) => {
        const matchesSearch = job.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        if (statusFilter === "all") return matchesSearch;
        if (statusFilter === "active") return matchesSearch && job.isActive;
        if (statusFilter === "inactive") return matchesSearch && !job.isActive;

        return matchesSearch;
      })
    : [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto max-w-7xl px-2 sm:px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Job Listings</h1>
        <Button
          onClick={() =>
            (window.location.href = "/dashboard/recruiter?tab=jobListing")
          }
          className="text-xs sm:text-sm"
        >
          Create New Job
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search job listings..."
            className="pl-8 w-full sm:w-48 md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
          >
            <SelectTrigger className="w-full sm:w-[140px] md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchJobListings}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2">Loading job listings...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 relative">
          {/* Job listings table */}
          <div
            className={`w-full ${
              selectedJob && window.innerWidth >= 1024 ? "lg:w-7/12" : "lg:w-full"
            } overflow-auto transition-all duration-300 ${
              showMobileSidebar ? "hidden lg:block" : "block"
            }`}
          >
            {jobListings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg mb-4 text-center">
                    You have not created any job listings yet.
                  </p>
                  <Button
                    onClick={() =>
                      (window.location.href = "/job-listings/create")
                    }
                  >
                    Create Your First Job Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%] sm:w-[300px]">Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Location</TableHead>
                          <TableHead className="hidden md:table-cell">Status</TableHead>
                          <TableHead className="hidden lg:table-cell">Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No job listings match your search criteria
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentItems.map((job) => (
                            <TableRow
                              key={job.id}
                              className={`cursor-pointer hover:bg-slate-50 ${
                                selectedJob?.id === job.id ? "bg-blue-50" : ""
                              }`}
                              onClick={() => handleJobSelection(job)}
                            >
                              <TableCell className="font-medium py-3">
                                <div className="flex items-start">
                                  {job.isFeatured && (
                                    <Star className="h-4 w-4 text-yellow-500 mr-1 mt-1 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <div className="truncate">{job.title}</div>
                                    <div className="text-xs text-gray-500">
                                      {employmentTypeLabels[job.employmentType]}
                                    </div>
                                    <div className="flex items-center sm:hidden mt-1">
                                      {job.location && (
                                        <>
                                          <MapPin className="h-3 w-3 mr-1" />
                                          <span className="text-xs truncate">{job.location}</span>
                                        </>
                                      )}
                                      <Badge
                                        variant={job.isActive ? "default" : "secondary"}
                                        className={`ml-2 ${job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                                      >
                                        {job.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell py-3">
                                {job.location ? (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span className="truncate">{job.location}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    Not specified
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell py-3">
                                <Badge
                                  variant={job.isActive ? "default" : "secondary"}
                                  className={job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                >
                                  {job.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell py-3">
                                {formatDate(job.createdAt)}
                              </TableCell>
                              <TableCell className="text-right py-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {/* <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToEdit(job.id);
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem> */}
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(job.id);
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          `/jobs/${job.slug}`,
                                          "_blank"
                                        );
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Public Page
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>

                  {/* Pagination */}
                  {filteredJobs.length > itemsPerPage && (
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-3">
                      <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1}-
                        {Math.min(indexOfLastItem, filteredJobs.length)} of{" "}
                        {filteredJobs.length} listings
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                          )
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-1 sm:px-2">...</span>
                              )}
                              <Button
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => paginate(page)}
                                className="h-8 w-8 p-0 sm:h-9 sm:w-9 sm:px-3"
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </>
            )}
          </div>

          {/* Job details sidebar */}
          {selectedJob && (
            <div className={`w-full lg:w-5/12 xl:w-4/12 flex-shrink-0 ${showMobileSidebar ? 'block fixed inset-0 z-50 bg-background p-4 overflow-auto lg:static lg:bg-transparent' : 'hidden lg:block'}`}>
              <Card className="h-full lg:sticky lg:top-4">
                <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                  <div className="pr-4">
                    <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0 lg:hidden"
                    onClick={closeMobileSidebar}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4 py-2">
                  {/* Status badges in one row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={selectedJob.isActive ? "default" : "secondary"}
                    >
                      {selectedJob.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {selectedJob.isFeatured && (
                      <Badge
                        variant="outline"
                        className="border-yellow-300 text-yellow-700"
                      >
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                    {selectedJob.category && (
                      <Badge variant="outline" className="hidden sm:flex">
                        <Globe className="h-3 w-3 mr-1" />
                        {selectedJob.category.name}
                        {selectedJob.subcategory &&
                          ` • ${selectedJob.subcategory.name}`}
                      </Badge>
                    )}
                  </div>

                  {/* Job metadata in grid layout */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-sm">
                    {selectedJob.location && (
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{selectedJob.location}</span>
                      </div>
                    )}

                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                      <span className="truncate">
                        Created: {formatDate(selectedJob.createdAt)}
                      </span>
                    </div>

                    {selectedJob.expiresAt && (
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                        <span className="truncate">
                          Expires: {formatDate(selectedJob.expiresAt)}
                        </span>
                      </div>
                    )}

                    {selectedJob.employmentType && (
                      <div className="flex items-center">
                        <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                        <span>{employmentTypeLabels[selectedJob.employmentType]}</span>
                      </div>
                    )}

                    {selectedJob.openings > 0 && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Openings:</span>
                        <span>{selectedJob.openings}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-2" />

                  {/* Job details in grid layout */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-sm">
                    {selectedJob.department && (
                      <div>
                        <span className="font-medium">Department:</span>{" "}
                        <span className="truncate">{selectedJob.department}</span>
                      </div>
                    )}

                    {selectedJob.role && (
                      <div>
                        <span className="font-medium">Role:</span>{" "}
                        <span className="truncate">{selectedJob.role}</span>
                      </div>
                    )}

                    {selectedJob.salary && (
                      <div>
                        <span className="font-medium">Salary:</span>{" "}
                        <span className="truncate">{selectedJob.salary}</span>
                      </div>
                    )}

                    {selectedJob.duration && (
                      <div>
                        <span className="font-medium">Duration:</span>{" "}
                        <span className="truncate">{selectedJob.duration}</span>
                      </div>
                    )}

                    {selectedJob.startDate && (
                      <div>
                        <span className="font-medium">Start:</span>{" "}
                        <span className="truncate">{selectedJob.startDate}</span>
                      </div>
                    )}

                    {selectedJob.education && (
                      <div className="xs:col-span-2 flex items-start">
                        <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">Education: </span>
                          {selectedJob.education}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description with controlled height */}
                  {selectedJob.description && (
                    <>
                      <Separator className="my-2" />
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Description
                        </h4>
                        <p className="text-sm whitespace-pre-line max-h-32 overflow-y-auto pr-1">
                          {selectedJob.description}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Highlights, Qualifications and Skills */}
                  {((selectedJob.highlights?.length ?? 0) > 0 ||
                    (selectedJob.qualifications?.length ?? 0) > 0 ||
                    (selectedJob.skills?.length ?? 0) > 0) && (
                    <>
                      <Separator className="my-2" />
                      <div className="space-y-4">
                        {/* Highlights */}
                        {(selectedJob.highlights ?? []).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <Award className="h-4 w-4 mr-1.5 text-blue-500" />
                              Job Highlights
                            </h4>
                            <ul className="text-xs list-disc pl-5 space-y-1 max-h-24 overflow-y-auto">
                              {(selectedJob.highlights ?? []).map(
                                (highlight, index) => (
                                  <li key={index} className="leading-relaxed">{highlight}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Qualifications */}
                        {(selectedJob.qualifications ?? []).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <GraduationCap className="h-4 w-4 mr-1.5 text-green-500" />
                              Qualifications
                            </h4>
                            <ul className="text-xs list-disc pl-5 space-y-1 max-h-24 overflow-y-auto">
                              {(selectedJob.qualifications ?? []).map((qual, index) => (
                                <li key={index} className="leading-relaxed">{qual}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Skills */}
                        {(selectedJob.skills ?? []).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <Award className="h-4 w-4 mr-1.5 text-purple-500" />
                              Required Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                              {(selectedJob.skills ?? []).map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs py-1 px-2"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>

                <CardFooter className="pt-0 flex flex-col xs:flex-row justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(`/jobs/${selectedJob.slug}`, "_blank")
                    }
                    className="text-xs w-full xs:w-auto"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View Public Page
                  </Button>
                  <div className="flex gap-2 w-full xs:w-auto">
                    {/* <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigateToEdit(selectedJob.id)}
                      className="text-xs flex-1"
                    >
                      <Edit className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button> */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(selectedJob.id)}
                      className="text-xs flex-1"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Job Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job listing? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob} className="flex-1">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobListingDashboard;