/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle, Clock, MapPin, Users } from "lucide-react";
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
  [key: string]: any; // Allow additional properties
}

const FeaturedJobs = ({ job }: { job: Job }) => {
  // Check if job is active before rendering
  if (!job.isActive) {
    return (
      <div className="w-full h-full p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md border border-gray-100 flex flex-col justify-center items-center">
        <p className="text-gray-500 text-sm sm:text-base">This job is no longer active</p>
      </div>
    );
  }

  const postedDate = new Date(job.postedAt);
  const formattedDate = isNaN(postedDate.getTime())
    ? "Invalid Date"
    : postedDate.toLocaleDateString();

  return (
    <div className="w-full h-full p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className="flex flex-col h-full space-y-3">
        {/* Company Logo and Name */}
        <Link
          href={`/jobs/${job.id}`}
          className="block"
          scroll={true}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-sm bg-white p-1 border border-gray-100 flex-shrink-0">
              <Image
                src={job.company?.logo || "/default-logo.png"}
                alt={`${job.company?.name || "Company"} Logo`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-900 truncate capitalize">
                  {job.company?.name || "Unknown Company"}
                </h2>
                {job.company?.isVerified && (
                  <CheckCircle
                    size={10}
                    className="text-blue-500 bg-white rounded-full flex-shrink-0"
                  />
                )}
              </div>
              <div className="text-xs text-gray-600 flex items-center mt-0.5">
                <MapPin size={10} className="mr-1 flex-shrink-0" />
                <span className="truncate capitalize">{job.location}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Job Details Link */}
        <Link
          href={`/jobs/${job.id}`}
          className="block group-hover:text-blue-700 transition-colors duration-300"
        >
          <h3 className="text-sm sm:text-base font-bold text-blue-800 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 h-10 sm:h-12 overflow-hidden capitalize">
            {job.title}
          </h3>

          <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-gray-700 mb-3">
            <div className="flex items-center text-xs">
              <Clock size={12} className="mr-1 text-gray-500 flex-shrink-0" />
              <span className="truncate">{job.employmentType}</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="truncate">{job.salary}</span>
            </div>
            <div className="flex items-center text-xs col-span-2">
              <Users size={12} className="mr-1 text-gray-500 flex-shrink-0" />
              <span className="truncate">
                {job.openings} {job.openings > 1 ? "positions" : "position"}
              </span>
            </div>
          </div>
        </Link>

        {/* Skills - Responsive design */}
        <div className="flex flex-wrap gap-1.5 mb-3 max-h-14 overflow-hidden">
          {job.skills && job.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 truncate max-w-[120px] sm:max-w-[140px]"
            >
              {skill}
            </span>
          ))}
          {job.skills && job.skills.length > 3 && (
            <span
              className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100"
              title={job.skills.slice(3).join(", ")}
            >
              +{job.skills.length - 3}
            </span>
          )}
        </div>

        {/* Posted date and applicants count */}
        <div className="flex justify-between text-xs text-gray-500 mt-auto">
          <div className="flex items-center">
            <Clock size={10} className="mr-1 text-gray-400 flex-shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-none">Posted: {formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Users size={10} className="mr-1 text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.applicantsCount} applied</span>
          </div>
        </div>
      </div>
      
      {/* Apply Button - Responsive */}
      <Link
        href={{
          pathname: "/jobs/apply",
          query: { id: job.id, title: job.title },
        }}
        className="w-full block text-center px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 ease-in-out shadow-sm text-xs sm:text-sm mt-3"
        aria-label={`Apply for ${job.title} at ${job.company?.name}`}
      >
        Apply Now
      </Link>
    </div>
  );
};

export default FeaturedJobs;