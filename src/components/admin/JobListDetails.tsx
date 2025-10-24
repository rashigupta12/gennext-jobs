// JobListDetails.tsx
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Briefcase,
  Calendar,
  Eye,
  Globe,
  GraduationCap,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";

// Reuse the JobListing interface (or import from a shared types file)
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

// Reuse employmentTypeLabels and formatDate
const employmentTypeLabels = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface JobListDetailsProps {
  job: JobListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewPublic: (slug: string) => void;
  onDelete: (id: string) => void;
  // onEdit: (id: string) => void; // Uncomment if needed
}

const JobListDetails: React.FC<JobListDetailsProps> = ({
  job,
  open,
  onOpenChange,
  onViewPublic,
  onDelete,
  // onEdit,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90vw] sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg">{job.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-2">
          {/* Status badges in one row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={job.isActive ? "default" : "secondary"}
            >
              {job.isActive ? "Active" : "Inactive"}
            </Badge>
            {job.isFeatured && (
              <Badge
                variant="outline"
                className="border-yellow-300 text-yellow-700"
              >
                <Star className="h-3 w-3 mr-1" /> Featured
              </Badge>
            )}
            {job.category && (
              <Badge variant="outline" className="hidden sm:flex">
                <Globe className="h-3 w-3 mr-1" />
                {job.category.name}
                {job.subcategory &&
                  ` • ${job.subcategory.name}`}
              </Badge>
            )}
          </div>

          {/* Job metadata in grid layout */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-sm">
            {job.location && (
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
            )}

            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
              <span className="truncate">
                Created: {formatDate(job.createdAt)}
              </span>
            </div>

            {job.expiresAt && (
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">
                  Expires: {formatDate(job.expiresAt)}
                </span>
              </div>
            )}

            {job.employmentType && (
              <div className="flex items-center">
                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <span>{employmentTypeLabels[job.employmentType]}</span>
              </div>
            )}

            {job.openings > 0 && (
              <div className="flex items-center">
                <span className="font-medium mr-1">Openings:</span>
                <span>{job.openings}</span>
              </div>
            )}
          </div>

          <Separator className="my-2" />

          {/* Job details in grid layout */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-sm">
            {job.department && (
              <div>
                <span className="font-medium">Department:</span>{" "}
                <span className="truncate">{job.department}</span>
              </div>
            )}

            {job.role && (
              <div>
                <span className="font-medium">Role:</span>{" "}
                <span className="truncate">{job.role}</span>
              </div>
            )}

            {job.salary && (
              <div>
                <span className="font-medium">Salary:</span>{" "}
                <span className="truncate">{job.salary}</span>
              </div>
            )}

            {job.duration && (
              <div>
                <span className="font-medium">Duration:</span>{" "}
                <span className="truncate">{job.duration}</span>
              </div>
            )}

            {job.startDate && (
              <div>
                <span className="font-medium">Start:</span>{" "}
                <span className="truncate">{job.startDate}</span>
              </div>
            )}

            {job.education && (
              <div className="xs:col-span-2 flex items-start">
                <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">Education: </span>
                  {job.education}
                </span>
              </div>
            )}
          </div>

          {/* Description with controlled height */}
          {job.description && (
            <>
              <Separator className="my-2" />
              <div>
                <h4 className="text-sm font-medium mb-1">
                  Description
                </h4>
                <p className="text-sm whitespace-pre-line max-h-32 overflow-y-auto pr-1">
                  {job.description}
                </p>
              </div>
            </>
          )}

          {/* Highlights, Qualifications and Skills */}
          {((job.highlights?.length ?? 0) > 0 ||
            (job.qualifications?.length ?? 0) > 0 ||
            (job.skills?.length ?? 0) > 0) && (
            <>
              <Separator className="my-2" />
              <div className="space-y-4">
                {/* Highlights */}
                {(job.highlights ?? []).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <Award className="h-4 w-4 mr-1.5 text-blue-500" />
                      Job Highlights
                    </h4>
                    <ul className="text-xs list-disc pl-5 space-y-1 max-h-24 overflow-y-auto">
                      {(job.highlights ?? []).map(
                        (highlight, index) => (
                          <li key={index} className="leading-relaxed">{highlight}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Qualifications */}
                {(job.qualifications ?? []).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1.5 text-green-500" />
                      Qualifications
                    </h4>
                    <ul className="text-xs list-disc pl-5 space-y-1 max-h-24 overflow-y-auto">
                      {(job.qualifications ?? []).map((qual, index) => (
                        <li key={index} className="leading-relaxed">{qual}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills */}
                {(job.skills ?? []).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <Award className="h-4 w-4 mr-1.5 text-purple-500" />
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {(job.skills ?? []).map((skill, index) => (
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
        </div>

        <SheetFooter className="pt-4 flex flex-col xs:flex-row justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPublic(job.slug)}
            className="text-xs w-full xs:w-auto"
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            View Public Page
          </Button>
          <div className="flex gap-2 w-full xs:w-auto">
            {/* <Button
              variant="default"
              size="sm"
              onClick={() => onEdit(job.id)}
              className="text-xs flex-1"
            >
              <Edit className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button> */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(job.id)}
              className="text-xs flex-1"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default JobListDetails;