// Dashboard.tsx with Fixed Responsive Split View
/* eslint-disable @typescript-eslint/no-unused-vars*/
"use client";
import {
  fetchAllJobLocations,
  fetchCategories,
  fetchCompanies,
  fetchJobApplications,
  fetchJobDetails,
  fetchResumes,
} from "@/api";
import { MergedSidebar } from "@/components/common/Filterapllication";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationCard } from "@/components/users/applicationCard";
import { DetailView } from "@/components/users/DetailView";
// import { MergedSidebar } from "@/components/users/FilterSidebar";
import { combineData, filterApplications } from "@/helpers";
import {
  ALL_JOB_TYPES,
  APPLICATION_STATUSES,
  Filters,
  JobApplicationView,
  JobListing,
} from "@/types";
import { Filter } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [applications, setApplications] = useState<JobApplicationView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: [],
    location: [],
    employmentType: [],
    salaryMin: "",
    salaryMax: "",
    
    dateFrom: null,
    dateTo: null,
    skills: [],
  });
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [employmentTypeOptions, setEmploymentTypeOptions] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationView | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState<boolean>(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") {
      setError("You must be logged in to view your applications");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const allLocations = await fetchAllJobLocations();
        setLocationOptions(allLocations);
        setEmploymentTypeOptions(ALL_JOB_TYPES.map(type => type));
        
        const userId = session?.user?.id;
        if (!userId) throw new Error("User ID is missing");

        const jobApplications = await fetchJobApplications(userId);
        
        // if (jobApplications.length === 0) {
        //   setApplications([]);
        //   setLoading(false);
        //   window.location.href = "/jobs";
        //   return;
        // }

        const jobIds = jobApplications.map((app) => app.jobId);
        const jobsData: JobListing[] = await fetchJobDetails(jobIds);
        
        const [categoriesData, companiesData, resumesData] =
          await Promise.all([
            fetchCategories([
              ...new Set(jobsData.map((job) => job.categoryId)),
            ]),
            fetchCompanies(jobsData.map((job) => job.companyId)),
            fetchResumes(jobApplications.map((app) => app.resumeId)),
          ]);
        
        const combinedData: JobApplicationView[] = combineData(
          jobApplications,
          jobsData,
          companiesData,
          categoriesData,
          [],
          resumesData,
          APPLICATION_STATUSES
        ) as JobApplicationView[];
        
        setApplications(combinedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load your applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionStatus, session]);

  const filteredApplications = filterApplications(applications, filters);

  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await fetch(
        `/api/application?applicationId=${applicationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to withdraw application: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Application withdrawn successfully:", result);
      
      setApplications(prev => prev.filter(app => app.application.id !== applicationId));
      
      if (selectedApplication?.application.id === applicationId) {
        setIsDetailViewOpen(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error("Failed to withdraw application:", error);
    }
  };

  const handleViewJob = (application: JobApplicationView) => {
    setSelectedApplication(application);
    setIsDetailViewOpen(true);
  };

  const closeDetailView = () => {
    setIsDetailViewOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: [],
      location: [],
      employmentType: [],
      salaryMin: "",
      salaryMax: "",
      dateFrom: null,
      dateTo: null,
      skills: [],
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background pt-20">
        <Navbar />
        
        {/* Mobile Search Bar - Always visible on mobile */}
        <div className="lg:hidden px-4 py-4 bg-background border-b sticky top-16 z-40">
          <Input
            type="text"
            placeholder="Search applications..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <div className="flex min-h-screen">
          {/* Desktop Sidebar - Hidden on mobile */}
          <MergedSidebar
            filters={filters}
            statusOptions={APPLICATION_STATUSES}
            locationOptions={locationOptions}
            employmentTypeOptions={ALL_JOB_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
            loading={loading}
            updateSearchFilter={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            updateStatusFilter={(statusId) =>
              setFilters((prev) => ({
                ...prev,
                status: prev.status.includes(statusId)
                  ? prev.status.filter((s) => s !== statusId)
                  : [...prev.status, statusId],
              }))
            }
            updateLocationFilter={(location) =>
              setFilters((prev) => ({
                ...prev,
                location: prev.location.includes(location)
                  ? prev.location.filter((l) => l !== location)
                  : [...prev.location, location],
              }))
            }
            updateEmploymentTypeFilter={(type) =>
              setFilters((prev) => ({
                ...prev,
                employmentType: prev.employmentType.includes(type)
                  ? prev.employmentType.filter((t) => t !== type)
                  : [...prev.employmentType, type],
              }))
            }
            // updateStatusFilter={(field: any, date: any) =>
            //   setFilters((prev) => ({ ...prev, [field]: date }))
            // }
            // onFilterChange={(name, value) =>
            //   setFilters((prev) => ({ ...prev, [name]: value }))
            // }
            onResetFilters={handleResetFilters}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
            {/* Applications List */}
            <div className={`${
              isDetailViewOpen 
                ? "hidden lg:block lg:w-2/5 xl:w-1/3" 
                : "w-full"
            } p-4 md:p-6 overflow-auto`}>
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">My Job Applications</h1>
                    {!loading && (
                      <p className="text-muted-foreground">
                        {filteredApplications.length} application
                        {filteredApplications.length !== 1 ? "s" : ""} found
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between">
                          <div>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </CardContent>
                      <CardFooter className="border-t flex justify-end gap-2 p-4">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-28" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {error && !loading && (
                <Card className="bg-destructive/10 border-destructive/20">
                  <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {!loading && !error && applications.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No Applications Yet</CardTitle>
                    <CardDescription>
                      You have not applied to any jobs yet.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={() => (window.location.href = "/jobs")}>
                      Explore Jobs
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {!loading && !error && applications.length > 0 && (
                <div className="space-y-4">
                  {filteredApplications.length === 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>No Results Found</CardTitle>
                        <CardDescription>
                          No applications match your current filters.
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button
                          variant="outline"
                          onClick={handleResetFilters}
                        >
                          Clear Filters
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    filteredApplications.map((app) => (
                      <ApplicationCard
                        key={app.application.id}
                        application={app}
                        withdrawApplication={(applicationId) =>
                          withdrawApplication(applicationId)
                        }
                        onViewJob={() => handleViewJob(app)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Detail View - Mobile: Full Screen, Desktop: Split View */}
            {isDetailViewOpen && (
              <div className={`${
                isDetailViewOpen 
                  ? "fixed inset-0 z-50 bg-background lg:relative lg:flex-1 lg:w-3/5 xl:w-2/3" 
                  : "hidden"
              } border-l overflow-auto`}>
                <DetailView 
                  application={selectedApplication} 
                  onClose={closeDetailView} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Applications</SheetTitle>
                <SheetDescription>
                  Narrow down your applications with these filters
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Status Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Status</h3>
                  {APPLICATION_STATUSES.map((status) => (
                    <div key={status.id} className="flex items-center space-x-3 mb-3">
                      <Checkbox
                        id={`mobile-status-${status.id}`}
                        checked={filters.status.includes(status.id)}
                        onCheckedChange={() => setFilters((prev) => ({
                          ...prev,
                          status: prev.status.includes(status.id)
                            ? prev.status.filter((s) => s !== status.id)
                            : [...prev.status, status.id],
                        }))}
                      />
                      <Label
                        htmlFor={`mobile-status-${status.id}`}
                        className="flex items-center text-sm cursor-pointer flex-1"
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: status.color || "#888888" }}
                        />
                        {status.name}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Location</h3>
                  <div className="max-h-40 overflow-y-auto">
                    {locationOptions.slice(0, 8).map((location) => (
                      <div key={location} className="flex items-center space-x-3 mb-3">
                        <Checkbox
                          id={`mobile-location-${location}`}
                          checked={filters.location.includes(location)}
                          onCheckedChange={() => setFilters((prev) => ({
                            ...prev,
                            location: prev.location.includes(location)
                              ? prev.location.filter((l) => l !== location)
                              : [...prev.location, location],
                          }))}
                        />
                        <Label 
                          htmlFor={`mobile-location-${location}`}
                          className="text-sm cursor-pointer flex-1 truncate"
                        >
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employment Type Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Job Type</h3>
                  {ALL_JOB_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-3 mb-3">
                      <Checkbox
                        id={`mobile-type-${type}`}
                        checked={filters.employmentType.includes(type)}
                        onCheckedChange={() => setFilters((prev) => ({
                          ...prev,
                          employmentType: prev.employmentType.includes(type)
                            ? prev.employmentType.filter((t) => t !== type)
                            : [...prev.employmentType, type],
                        }))}
                      />
                      <Label 
                        htmlFor={`mobile-type-${type}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Salary Range Filter */}
                {/* <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Salary Range</h3>
                  <Select
                    value={filters.salaryRange || "0"}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, salaryRange: value }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Salary</SelectItem>
                      <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                      <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
                      <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
                      <SelectItem value="100000-150000">$100,000 - $150,000</SelectItem>
                      <SelectItem value="150000-200000">$150,000 - $200,000</SelectItem>
                      <SelectItem value="200000+">$200,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                {/* Reset Filters Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetFilters}
                >
                  Reset All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Bottom padding for mobile filter button */}
        <div className="h-20 lg:hidden"></div>
      </div>
      <Footer />
    </>
  );
}