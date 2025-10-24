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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
// import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  title: string;
  userId: string;
}

interface Application {
  id: string;
  user?: { name: string; email?: string };
  job?: { title: string; id: string };
  appliedAt: string;
  status: string;
  resume?: { resumeUrl: string };
}

interface Filters {
  status: string;
  jobId: string;
  dateFrom: string;
  dateTo: string;
}

const Application = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { data: session, status } = useSession();
  // const { toast } = useToast();

  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    jobId: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Optimized fetch with useCallback
  const fetchRecruiterJobs = useCallback(async () => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("You must be logged in to view applications");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const recruiterId = session?.user?.id;
      if (!recruiterId) throw new Error("Recruiter information not found");

      const res = await fetch(`/api/job-listing?userId=${recruiterId}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data = await res.json();
      setRecruiterJobs(data.jobListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error:", err);
      setLoading(false);
    }
  }, [session, status]);

  const fetchApplications = useCallback(async () => {
    if (status === "loading" || (recruiterJobs.length === 0 && !jobId)) return;

    try {
      setLoading(true);
      let url = "";

      if (jobId) {
        const isAuthorized = recruiterJobs.some((job) => job.id === jobId);
        if (!isAuthorized && recruiterJobs.length > 0) {
          throw new Error("Unauthorized access");
        }
        url = `/api/application?jobId=${jobId}`;
      } else {
        const jobIds = recruiterJobs.map((job) => job.id);
        if (jobIds.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }
        url = `/api/application?jobIds=${jobIds.join(",")}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch applications");

      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [recruiterJobs, jobId, status]);

  useEffect(() => {
    fetchRecruiterJobs();
  }, [fetchRecruiterJobs]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Update application status
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      setUpdatingStatus(applicationId);

      const res = await fetch(`/api/application`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          applicationId,
          status: newStatus 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // const data = await res.json();

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      // toast({
      //   title: "Status Updated",
      //   description: `Application status changed to ${newStatus}`,
      // });
    } catch (err) {
      // toast({
      //   title: "Error",
      //   description: err instanceof Error ? err.message : "Failed to update status",
      //   variant: "destructive",
      // });
      console.log(err)
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Memoized filtering
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const searchMatch =
        !searchTerm ||
        app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = filters.status === "all" || app.status === filters.status;
      const jobMatch = filters.jobId === "all" || app.job?.id === filters.jobId;

      const appDate = new Date(app.appliedAt);
      const dateFromMatch = !filters.dateFrom || appDate >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo || appDate <= new Date(filters.dateTo);

      return searchMatch && statusMatch && jobMatch && dateFromMatch && dateToMatch;
    });
  }, [applications, searchTerm, filters]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SHORTLISTED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-red-100 text-red-800",
      HIRED: "bg-green-100 text-green-800",
    };
    return colors[status?.toUpperCase()] || "bg-gray-100 text-gray-800";
  };

  // Export to CSV
  // const exportToCSV = () => {
  //   const headers = ["Applicant", "Email", "Job", "Date", "Status", "Resume URL"];
  //   const rows = filteredApplications.map((app) => [
  //     app.user?.name || "Unknown",
  //     app.user?.email || "N/A",
  //     app.job?.title || "Unknown",
  //     formatDate(app.appliedAt),
  //     app.status,
  //     app.resume?.resumeUrl || "N/A",
  //   ]);

  //   const csv = [
  //     headers.join(","),
  //     ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
  //   ].join("\n");

  //   const blob = new Blob([csv], { type: "text/csv" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  // // Export to JSON
  // const exportToJSON = () => {
  //   const json = JSON.stringify(filteredApplications, null, 2);
  //   const blob = new Blob([json], { type: "application/json" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `applications_${new Date().toISOString().split("T")[0]}.json`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  // // Import from JSON
  // const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = (ev) => {
  //     try {
  //       const data = JSON.parse(ev.target?.result as string);
  //       if (Array.isArray(data)) {
  //         setApplications(data);
  //         // toast({
  //         //   title: "Import Successful",
  //         //   description: `Imported ${data.length} applications`,
  //         // });
  //       } else {
  //         // toast({
  //         //   title: "Invalid Format",
  //         //   description: "Expected an array of applications",
  //         //   variant: "destructive",
  //         // });
  //       }
  //     } catch {
  //       // toast({
  //       //   title: "Error",
  //       //   description: "Failed to parse JSON file",
  //       //   variant: "destructive",
  //       // });
  //     }
  //   };
  //   reader.readAsText(file);
  // };

  const clearFilters = () => {
    setFilters({ status: "all", jobId: "all", dateFrom: "", dateTo: "" });
    setSearchTerm("");
  };

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="text-red-500 p-4">Please log in</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold mb-2">No Applications Found</h2>
        <p className="text-gray-500">
          {jobId ? "No applications for this job." : "No applications yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-2 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, job, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="HIRED">Hired</SelectItem>
            </SelectContent>
          </Select>

          {/* Job Filter */}
          {!jobId && (
            <Select value={filters.jobId} onValueChange={(v) => setFilters({ ...filters, jobId: v })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {recruiterJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-[160px]"
            placeholder="From date"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-[160px]"
            placeholder="To date"
          />
          <Button variant="outline" onClick={clearFilters} size="icon" title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Export/Import */}
        {/* <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
         
        </div> */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No applications match your filters
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Change Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{app.user?.name || "Unknown"}</div>
                      {app.user?.email && (
                        <div className="text-sm text-gray-500">{app.user.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{app.job?.title || "Unknown Job"}</TableCell>
                  <TableCell>{formatDate(app.appliedAt)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(newStatus) => updateApplicationStatus(app.id, newStatus)}
                      disabled={updatingStatus === app.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          app.resume?.resumeUrl || "https://example.com/default-resume.pdf",
                          "_blank"
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-1" /> Resume
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Application;