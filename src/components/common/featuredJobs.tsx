/*eslint-disable @typescript-eslint/no-explicit-any*/
import { CheckCircle, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

interface Job {
  id: string;
  title: string;
  companyId: string;
  company: Company;
  location: string;
  employmentType: string;
  duration: string;
  salary: string;
  highlights: string[];
  slug: string;
  categoryId: string;
  subcategoryId: string;
  startDate: string;
  endDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
  createdAt: string;
  updatedAt: string;
  applicantsCount: number;
  openings: number;
  postedAt: string;
  expiresAt: string;
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
  isFeatured: boolean;
  isActive: boolean;
  [key: string]: any;
}

const FeaturedJobs = ({ job }: { job: Job }) => {
  if (!job.isActive) {
    return (
      <div className="w-full h-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
        <p className="text-gray-500">This job is no longer active</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-1">
        {/* Header Section - Fixed Height */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 p-2 flex-shrink-0 flex items-center justify-center">
              <Image
                src={job.company?.logo || "/default-logo.png"}
                alt={`${job.company?.name || "Company"} Logo`}
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.id}`} className="block group">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors capitalize line-clamp-2 ">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 tracking-wide font-medium mb-2">
                  <span className="capitalize">{job.company?.name || "Unknown Company"}</span>
                  {job.company?.isVerified && (
                    <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </Link>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                <span className="tracking-wide font-medium capitalize">{job.location}</span>
              </div>
            </div>
          </div>
          {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
              <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
            </svg>
          </button> */}
        </div>

        {/* Job Type and Salary - Fixed Height */}
        <div className="flex items-center gap-4 text-base mb-4 min-h-[1.5rem]">
          <span className="font-medium text-gray-900">{job.experience?.[0] || 'Mid-Senior'}</span>
          <span className="font-medium text-gray-900">{job.employmentType}</span>
          <span className="font-bold text-gray-900">{job.salary}</span>
        </div>

        {/* Description - Fixed Height */}
        <div className="mb-4 min-h-[4.5rem]">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {job.description}
          </p>
        </div>

        {/* Skills/Tags - Fixed Height */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[4rem] content-start">
          {job.skills && job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg capitalize h-fit"
            >
              {skill}
            </span>
          ))}
          {job.skills && job.skills.length > 4 && (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg h-fit">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Footer - Always at bottom */}
        {/* <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <span className="text-sm text-gray-500">{formattedDate}</span>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Dismiss job"
            >
              <X size={20} className="text-gray-600" />
            </button>
            <button 
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Save job"
            >
              <Heart size={20} className="text-gray-600 hover:text-red-500" />
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default FeaturedJobs;