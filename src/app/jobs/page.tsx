/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  fetchAllJobLocations,
  fetchAllJobs,
  fetchCategories,
  fetchCompanies,
  fetchSubcategories,
} from "@/api";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { Badge } from "@/components/ui/badge";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MergedSidebar } from "@/components/users/FilterSidebar";
import SalaryFilter from "@/components/users/SalaryFilter";
import {
  combineJobData,
  filterJobs,
  formatDateddmmyyy,
  formatEmploymentType,
} from "@/helpers";
import {
  ALL_JOB_TYPES,
  APPLICATION_STATUSES,
  Category,
  Company,
  Filters,
  JobApplicationView,
  JobListing,
  Subcategory,
} from "@/types";
import {
  Building,
  Calendar,
  DollarSign,
  Eye,
  FileText,
  Filter,
  MapPin,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const AllJobListings = () => {
  // State for job listings and data
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [combinedData, setCombinedData] = useState<
    {
      job: JobListing;
      company: Company;
      category: Category;
      subcategory?: Subcategory;
    }[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [applications, setApplications] = useState<JobApplicationView[]>([]);

  const handleSalaryRangeChange = useCallback(
    (minSalary: string, maxSalary: string) => {
      setFilters((prev) => ({
        ...prev,
        salaryMin: minSalary,
        salaryMax: maxSalary,
      }));
    },
    []
  );

  // Memoize other filter callbacks
  const updateSearchFilter = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const updateStatusFilter = useCallback((statusId: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(statusId)
        ? prev.status.filter((s) => s !== statusId)
        : [...prev.status, statusId],
    }));
  }, []);

  const updateLocationFilter = useCallback((location: string) => {
    setFilters((prev) => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter((l) => l !== location)
        : [...prev.location, location],
    }));
  }, []);

  const updateEmploymentTypeFilter = useCallback((type: string) => {
    setFilters((prev) => ({
      ...prev,
      employmentType: prev.employmentType.includes(type)
        ? prev.employmentType.filter((t) => t !== type)
        : [...prev.employmentType, type],
    }));
  }, []);

  const updateDateFilter = useCallback(
    (field: "dateFrom" | "dateTo", date: Date | null) => {
      setFilters((prev) => ({ ...prev, [field]: date }));
    },
    []
  );

  const onFilterChange = useCallback((name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: [],
    location: [],
    employmentType: [],
    salaryMin: "",
    salaryMax: "",
    // salaryRange: "",
    dateFrom: null,
    dateTo: null,
    skills: [],
  });

  useEffect(() => {
    const queryParam = searchParams.get("query");
    if (queryParam) {
      setFilters((prev) => ({
        ...prev,
        search: queryParam,
      }));
    }
  }, [searchParams]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all jobs
        const jobs = (await fetchAllJobs()) as JobListing[];
        setJobListings(jobs);
        console.log("Jobs fetched:", jobs);

        // Extract IDs for secondary data
        const companyIds: string[] = [
          ...new Set(jobs.map((job: JobListing) => job.companyId as string)),
        ];
        const categoryIds: string[] = [
          ...new Set(
            jobs
              .map((job: JobListing) => job.categoryId as string)
              .filter((id: string): id is string => typeof id === "string")
          ),
        ];
        const subcategoryIds = jobs
          .map((job: JobListing) => job.subcategoryId)
          .filter(
            (id: string | undefined | null) => id !== undefined && id !== null
          );

        // Fetch secondary data in parallel
        const [
          categoriesData,
          companiesData,
          subcategoriesData,
          locationsData,
        ] = await Promise.all([
          fetchCategories(categoryIds),
          fetchCompanies(companyIds),
          fetchSubcategories(subcategoryIds),
          fetchAllJobLocations(),
        ]);

        setCategories(categoriesData);
        setCompanies(companiesData);
        setSubcategories(subcategoriesData);
        setLocationOptions(locationsData);

        // Combine all data using the imported helper function
        const combined = combineJobData(
          jobs,
          companiesData,
          categoriesData,
          subcategoriesData
        );

        setCombinedData(combined);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load job listings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and pagination using the imported filterJobs function
  const filteredData = useMemo(
    () => filterJobs(combinedData, filters),
    [combinedData, filters]
  );

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    const totalItems = filteredData.length;
    const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(calculatedTotalPages);
  }, [filteredData, itemsPerPage]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleResetFilters = useCallback(() => {
    const queryParam = searchParams.get("query");
    setFilters({
      search: queryParam || "",
      status: [],
      location: [],
      employmentType: [],
      skills: [],
      salaryMin: "",
      salaryMax: "",
      // salaryRange: "",
      dateFrom: null,
      dateTo: null,
    });
  }, [searchParams]);

  // Mobile card component for jobs
  const JobCard = ({ item }: { item: (typeof paginatedResults)[0] }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <Link href={`/jobs/${item.job.id}`} className="block">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg capitalize leading-tight">
                {item.job.title}
              </CardTitle>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Building className="h-3 w-3 mr-1" />
                <span className="capitalize">{item.company.name}</span>
              </div>
            </div>
            {item.job.isFeatured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="capitalize truncate">
              {item.job.location || "Remote/Flexible"}
            </span>
          </div>

          {item.job.salary && (
            <div className="flex items-center text-sm text-muted-foreground">
              
              <span>{item.job.salary}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{formatDateddmmyyy(item.job.createdAt.toString())}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              className={(() => {
                switch (item.job.employmentType) {
                  case "FULL_TIME":
                    return "bg-blue-500 hover:bg-blue-600 text-white";
                  case "PART_TIME":
                    return "bg-purple-500 hover:bg-purple-600 text-white";
                  case "CONTRACT":
                    return "bg-amber-500 hover:bg-amber-600 text-white";
                  case "FREELANCE":
                    return "bg-teal-500 hover:bg-teal-600 text-white";
                  case "INTERNSHIP":
                    return "bg-green-500 hover:bg-green-600 text-white";
                  case "REMOTE":
                    return "bg-pink-500 hover:bg-pink-600 text-white";
                  case "Temporary":
                    return "bg-red-500 hover:bg-red-600 text-white";
                  default:
                    return "bg-gray-500 hover:bg-gray-600 text-white";
                }
              })()}
            >
              {formatEmploymentType(item.job.employmentType)}
            </Badge>

            <Badge variant="outline" className="text-xs">
              {item.category.name}
            </Badge>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="pt-2 gap-2">
        <Link href={`/jobs/${item.job.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
       <Link
  href={`/jobs/apply?id=${item.job.id}&title=${encodeURIComponent(
    item.job.title
  )}&companyname=${encodeURIComponent(item.company.name)}`}
  className="flex-1"
>
          <Button size="sm" className="w-full">
            <FileText className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  function handleSalaryReset(): void {
    throw new Error("Function not implemented.");
  }

  console.log(filteredData)

  return (
    <>
      <div className="min-h-screen bg-background pt-16 ">
        <Navbar />

        <div className="relative overflow-hidden h-9 ">
          <div
            className="absolute whitespace-nowrap pt-2 "
            style={{
              animation: "marquee 15s linear infinite",
              width: "max-content",
            }}
          >
            <span className="text-sm  mx-4">
              Couldn&apos;t find a job of desired role?{" "}
              <Link
                href={`/profile/${session?.user?.id}`}
                className="font-medium text-blue-800 underline hover:text-blue-900 pl-0.5"
              >
                Please complete your profile
              </Link>
            </span>

            {/* Duplicate for seamless looping */}
            <span className="text-sm  mx-4">
              Couldn&apos;t find a job of desired role?{" "}
              <Link
                href={`/profile/${session?.user?.id}`}
                className="font-medium text-blue-800 underline hover:text-blue-900 pl-1"
              >
                Please complete your profile
              </Link>
            </span>

            <span className="text-sm  mx-4">
              Couldn&apos;t find a job of desired role?{" "}
              <Link
                href={`/profile/${session?.user?.id}`}
                className="font-medium text-blue-800 underline hover:text-blue-900 pl-1"
              >
                Please complete your profile
              </Link>
            </span>
            <span className="text-sm  mx-4">
              Couldn&apos;t find a job of desired role?{" "}
              <Link
                href={`/profile/${session?.user?.id}`}
                className="font-medium text-blue-800 underline hover:text-blue-900 pl-1"
              >
                Please complete your profile
              </Link>
            </span>
            <span className="text-sm  mx-4">
              Couldn&apos;t find a job of desired role?{" "}
              <Link
                href={`/profile/${session?.user?.id}`}
                className="font-medium text-blue-800 underline hover:text-blue-900 pl-1"
              >
                Please complete your profile
              </Link>
            </span>
          </div>
        </div>

        {/* Mobile Search Bar - Always visible on mobile */}
        <div className="lg:hidden px-4 py-2 pb-4 bg-background border-b sticky top-16 z-40">
          <Input
            type="text"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        <div className="flex">
          {/* Desktop Sidebar */}
          <MergedSidebar
            filters={filters}
            statusOptions={APPLICATION_STATUSES}
            locationOptions={locationOptions}
            employmentTypeOptions={ALL_JOB_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
            loading={loading}
            updateSearchFilter={updateSearchFilter}
            updateStatusFilter={updateStatusFilter}
            updateLocationFilter={updateLocationFilter}
            updateEmploymentTypeFilter={updateEmploymentTypeFilter}
            updateDateFilter={updateDateFilter}
            updateSalaryRangeFilter={handleSalaryRangeChange}
            onFilterChange={onFilterChange}
            onResetFilters={handleResetFilters}
          />

          <div className="flex-1 ">
            <div className="p-4 lg:py-6">
              <div className="mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* <div>
                    <h1 className="text-xl lg:text-xl font-bold">
                      All Job Listings
                    </h1>
                    {!loading && (
                      <p className="text-muted-foreground mt-1">
                        {filteredData.length} of {combinedData.length} jobs
                      </p>
                    )}
                  </div> */}
                </div>
              </div>

              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      {/* Desktop skeleton */}
                      <Card className="hidden lg:block">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between">
                            <div>
                              <Skeleton className="h-6 w-48 mb-2" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Mobile skeleton */}
                      <Card className="lg:hidden">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Skeleton className="h-5 w-40 mb-2" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-6 w-24" />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex gap-2 w-full">
                            <Skeleton className="h-8 flex-1" />
                            <Skeleton className="h-8 flex-1" />
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
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

              {!loading && !error && combinedData.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No Job Listings Found</CardTitle>
                    <CardDescription>
                      There are currently no job listings available.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              
              {!loading && !error && combinedData.length > 0 && (
                <>
                  {filteredData.length === 0 ? (
                  
                    <Card>
                      <CardHeader>
                        <CardTitle>No Results Found</CardTitle>
                        <CardDescription>
                          No job listings match your current filters.
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="outline" onClick={handleResetFilters}>
                          Clear Filters
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden lg:block">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="font-semibold">
                              All Job Listings
                            </CardTitle>
                            <CardDescription>
                              Browse all available job opportunities
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[300px]">
                                      Job Title
                                    </TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Salary</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Posted On</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {paginatedResults.map((item) => (
                               
                                    <TableRow
                                      key={item.job.id}
                                      // {console.log(item)}
                                      className="hover:bg-gray-50"
                                    >
                                      <TableCell className="font-medium">
                                        <Link
                                          href={`/jobs/${item.job.id}`}
                                          className="flex flex-col capitalize hover:text-blue-600"
                                        >
                                          {item.job.title}
                                          {item.job.isFeatured && (
                                            <Badge
                                              variant="secondary"
                                              className="w-fit mt-1"
                                            >
                                              Featured
                                            </Badge>
                                          )}
                                        </Link>
                                      </TableCell>
                                      <TableCell className="capitalize">
                                        {item.company.name}
                                      </TableCell>
                                      <TableCell className="capitalize">
                                        {item.category.name}
                                      </TableCell>
                                      <TableCell className="capitalize">
                                        {item.job.location || "Remote/Flexible"}
                                      </TableCell>
                                      <TableCell>
                                        {item.job.salary || ""}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={(() => {
                                            switch (item.job.employmentType) {
                                              case "FULL_TIME":
                                                return "bg-blue-500 hover:bg-blue-600 text-white";
                                              case "PART_TIME":
                                                return "bg-purple-500 hover:bg-purple-600 text-white";
                                              case "CONTRACT":
                                                return "bg-amber-500 hover:bg-amber-600 text-white";
                                              case "FREELANCE":
                                                return "bg-teal-500 hover:bg-teal-600 text-white";
                                              case "INTERNSHIP":
                                                return "bg-green-500 hover:bg-green-600 text-white";
                                              case "REMOTE":
                                                return "bg-pink-500 hover:bg-pink-600 text-white";
                                              case "Temporary":
                                                return "bg-red-500 hover:bg-red-600 text-white";
                                              default:
                                                return "bg-gray-500 hover:bg-gray-600 text-white";
                                            }
                                          })()}
                                        >
                                          {formatEmploymentType(
                                            item.job.employmentType
                                          )}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {formatDateddmmyyy(
                                          item.job.createdAt.toString()
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-2">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Link
                                                  href={`/jobs/${item.job.id}`}
                                                >
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="View Job Details"
                                                  >
                                                    <Eye size={16} />
                                                  </Button>
                                                </Link>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>View Details</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>

                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Link
                                                  href={`/jobs/apply?id=${
                                                    item.job.id
                                                  }&title=${encodeURIComponent(
                                                    item.job.title
                                                  )}&companyname=${encodeURIComponent(
                                                    item.company.name
                                                  )}`}
                                                >
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Apply Now"
                                                  >
                                                    <FileText size={16} />
                                                  </Button>
                                                </Link>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Apply Now</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-center border-t p-4">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    onClick={() =>
                                      handlePageChange(
                                        Math.max(1, currentPage - 1)
                                      )
                                    }
                                    aria-disabled={currentPage === 1}
                                    className={
                                      currentPage === 1
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                    }
                                  />
                                </PaginationItem>
                                {Array.from(
                                  { length: Math.min(5, totalPages) },
                                  (_, i) => {
                                    const pageNum =
                                      currentPage <= 3
                                        ? i + 1
                                        : currentPage >= totalPages - 2
                                        ? totalPages - 4 + i
                                        : currentPage - 2 + i;
                                    return (
                                      <PaginationItem key={i}>
                                        <PaginationLink
                                          onClick={() =>
                                            handlePageChange(pageNum)
                                          }
                                          isActive={currentPage === pageNum}
                                        >
                                          {pageNum}
                                        </PaginationLink>
                                      </PaginationItem>
                                    );
                                  }
                                )}
                                <PaginationItem>
                                  <PaginationNext
                                    onClick={() =>
                                      handlePageChange(
                                        Math.min(totalPages, currentPage + 1)
                                      )
                                    }
                                    aria-disabled={currentPage === totalPages}
                                    className={
                                      currentPage === totalPages
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                    }
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </CardFooter>
                        </Card>
                      </div>

                      {/* Mobile Card View */}
                      <div className="lg:hidden space-y-4">
                        {paginatedResults.map((item) => (
                          <JobCard key={item.job.id} item={item} />
                        ))}

                        {/* Mobile Pagination */}
                        <div className="flex items-center justify-center pt-4">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() =>
                                    handlePageChange(
                                      Math.max(1, currentPage - 1)
                                    )
                                  }
                                  aria-disabled={currentPage === 1}
                                  className={
                                    currentPage === 1
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }
                                />
                              </PaginationItem>
                              {Array.from(
                                { length: Math.min(3, totalPages) },
                                (_, i) => {
                                  const pageNum =
                                    currentPage <= 2
                                      ? i + 1
                                      : currentPage >= totalPages - 1
                                      ? totalPages - 2 + i
                                      : currentPage - 1 + i;
                                  return (
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        onClick={() =>
                                          handlePageChange(pageNum)
                                        }
                                        isActive={currentPage === pageNum}
                                      >
                                        {pageNum}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }
                              )}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() =>
                                    handlePageChange(
                                      Math.min(totalPages, currentPage + 1)
                                    )
                                  }
                                  aria-disabled={currentPage === totalPages}
                                  className={
                                    currentPage === totalPages
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Bottom padding for mobile filter button */}
            <div className="h-20 lg:hidden"></div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="rounded-full shadow-lg">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:max-w-md overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle>Filter Jobs</SheetTitle>
                  <SheetDescription>
                    Narrow down your job search with these filters
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <div className="space-y-6">
                    {/* Location Filter */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Location</h3>
                      {loading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : locationOptions && locationOptions.length > 0 ? (
                        locationOptions.slice(0, 5).map((location) => (
                          <div
                            key={location}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <Checkbox
                              id={`mobile-location-${location}`}
                              checked={filters.location.includes(location)}
                              onCheckedChange={() =>
                                setFilters((prev) => ({
                                  ...prev,
                                  location: prev.location.includes(location)
                                    ? prev.location.filter(
                                        (l) => l !== location
                                      )
                                    : [...prev.location, location],
                                }))
                              }
                            />
                            <Label
                              htmlFor={`mobile-location-${location}`}
                              className="text-sm cursor-pointer"
                            >
                              {location}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No locations available
                        </p>
                      )}
                    </div>

                    {/* Employment Type Filter */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Job Type</h3>
                      {ALL_JOB_TYPES.map((type) => (
                        <div
                          key={type}
                          className="flex items-center space-x-2 mb-2"
                        >
                          <Checkbox
                            id={`mobile-type-${type}`}
                            checked={filters.employmentType.includes(type)}
                            onCheckedChange={() =>
                              setFilters((prev) => ({
                                ...prev,
                                employmentType: prev.employmentType.includes(
                                  type
                                )
                                  ? prev.employmentType.filter(
                                      (t) => t !== type
                                    )
                                  : [...prev.employmentType, type],
                              }))
                            }
                          />
                          <Label
                            htmlFor={`mobile-type-${type}`}
                            className="text-sm cursor-pointer"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <SalaryFilter
                      onSalaryRangeChange={handleSalaryRangeChange}
                      onReset={handleSalaryReset}
                    />

                    {/* Reset Filters Button */}
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={handleResetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AllJobListings;
