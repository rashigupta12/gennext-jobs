/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { formatDateddmmyyy } from "@/helpers";
import { Award, Briefcase, Calendar, Clock, ExternalLink, MapPin, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
  company?: Company;
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

interface JobInfoProps {
  jobId: string;
  jobDetails: JobDetails;
  onApplyClick?: (jobId: string, jobTitle: string) => void;
}

const JobInfo = ({  jobDetails, onApplyClick }: JobInfoProps) => {

  const { data: session } = useSession(); // Get session data from NextAuth

  
  const handleApplyClick = () => {
    if (!session || session.user.role !== "USER") {
      alert("You can't apply for this job.");
      return;
    }
  
    if (jobDetails) {
      window.location.href = `/jobs/apply?id=${jobDetails.id}&title=${encodeURIComponent(jobDetails.title)}`;
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Job Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Company Logo */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shadow-md flex-shrink-0 bg-white p-2 border border-gray-100">
            <Image
              src={jobDetails.company?.logo || "/default-company-logo.png"}
              alt={`${jobDetails.company?.name} Logo`}
              width={100}
              height={100}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Job & Company Details */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-1 capitalize">
                {jobDetails.title}
              </h1>
              
              {/* Apply Button (desktop) */}
              <div className="hidden md:block">
                <button
                  onClick={() => handleApplyClick()}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                  Apply Now
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2 capitalize">
              <p className="text-lg md:text-xl font-semibold text-gray-700">
                {jobDetails.company?.name}
              </p>
              {jobDetails.company?.isVerified && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
              {jobDetails.company?.website && (
                <a
                  href={jobDetails.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                  title="Visit company website"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 md:gap-4 text-gray-600 mt-3 capitalize">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <MapPin size={16} className="text-blue-600" />
                <span className="text-sm md:text-base">{jobDetails.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <Clock size={16} className="text-green-600" />
                <span className="text-sm md:text-base">{jobDetails.employmentType}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <Briefcase size={16} className="text-indigo-600" />
                <span className="text-sm md:text-base">{jobDetails.duration}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Apply Button (mobile) */}
        <div className="md:hidden mt-4">
          <button
            onClick={() => onApplyClick ? onApplyClick(jobDetails.id, jobDetails.title) : window.location.href = `/jobs/apply?id=${jobDetails.id}&title=${encodeURIComponent(jobDetails.title)}`}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Job Details - Two Column Layout for Desktop */}
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Info Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-1 text-blue-800 font-medium">
                <Award size={18} />
                <span className="text-sm md:text-base">Compensation</span>
              </div>
              <p className="text-base md:text-lg font-semibold">{jobDetails.salary}</p>
              {jobDetails.workHours && (
                <p className="text-xs md:text-sm text-gray-600">Work Hours: {jobDetails.workHours}</p>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm capitalize">
              <div className="flex items-center gap-2 mb-1 text-blue-800 font-medium">
                <Users size={18} />
                <span className="text-sm md:text-base">Recruitment</span>
              </div>
              <p className="text-sm md:text-base">Openings: <span className="font-semibold">{jobDetails.openings}</span></p>
              <p className="text-sm md:text-base">Applicants: <span className="font-semibold">{jobDetails.applicantsCount}</span></p>
              {jobDetails.role && (
                <p className="text-xs md:text-sm text-gray-600">Role: {jobDetails.role}</p>
              )}
              {jobDetails.department && (
                <p className="text-xs md:text-sm text-gray-600">Department: {jobDetails.department}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 capitalize">
            <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
              Job Description
            </h3>
            <div className="text-gray-700 whitespace-pre-line text-sm md:text-base">
              {jobDetails.description}
            </div>
          </div>

          {/* Highlights */}
          {jobDetails.highlights && jobDetails.highlights.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                Key Highlights
              </h3>
              <ul className="space-y-2 text-gray-700 capitalize">
                {jobDetails.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm md:text-base">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {jobDetails.responsibilities && jobDetails.responsibilities.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                Responsibilities
              </h3>
              <ul className="space-y-2 text-gray-700 capitalize">
                {jobDetails.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm md:text-base">
                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grid Layout for Qualifications, Skills, Education, Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Qualifications */}
            {jobDetails.qualifications && jobDetails.qualifications.length > 0 && (
              <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                  Qualifications
                </h3>
                <ul className="space-y-2 text-gray-700 capitalize">
                  {jobDetails.qualifications.map((qualification, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm md:text-base">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{qualification}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {jobDetails.skills && jobDetails.skills.length > 0 && (
              <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                  Required Skills
                </h3>
                <ul className="space-y-2 text-gray-700 capitalize">
                  {jobDetails.skills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm md:text-base">
                      <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience */}
            {jobDetails.experience && jobDetails.experience.length > 0 && (
              <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 capitalize">
                <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                  Experience
                </h3>
                <ul className="space-y-2 text-gray-700 capitalize">
                  {jobDetails.experience.map((exp, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm md:text-base">
                      <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Additional Details Grid */}
          {(jobDetails.certifications?.length > 0 || jobDetails.languages?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Certifications */}
              {jobDetails.certifications && jobDetails.certifications.length > 0 && (
                <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                    Certifications
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    {jobDetails.certifications.map((cert, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm md:text-base">
                        <span className="inline-block w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {jobDetails.languages && jobDetails.languages.length > 0 && (
                <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                    Languages
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    {jobDetails.languages.map((lang, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm md:text-base">
                        <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{lang}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Company Info and Timeline */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-blue-50 p-4 md:p-6 rounded-lg shadow-sm capitalize">
            <div className="flex items-center gap-2 mb-3 text-blue-800 font-medium">
              <Calendar size={18} />
              <span className="text-sm md:text-base">Timeline</span>
            </div>
            <p className="text-sm md:text-base mb-2">Posted: <span className="font-semibold">{formatDateddmmyyy(jobDetails.postedAt)}</span></p>
            <p className="text-sm md:text-base">Expires: <span className="font-semibold">{formatDateddmmyyy(jobDetails.expiresAt)}</span></p>
          </div>

          {/* Company About Section */}
          {jobDetails.company?.about && (
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-100">
                About {jobDetails.company.name}
              </h3>
              <div className="space-y-2 mb-4 text-sm md:text-base">
                {jobDetails.company.industry && (
                  <div>
                    <span className="font-medium">Industry:</span> {jobDetails.company.industry}
                  </div>
                )}
                {jobDetails.company.rating && (
                  <div>
                    <span className="font-medium">Rating:</span> {jobDetails.company.rating}
                  </div>
                )}
                {jobDetails.company.address && (
                  <div>
                    <span className="font-medium">Location:</span> {jobDetails.company.address}
                  </div>
                )}
              </div>
              <p className="text-gray-700 text-sm md:text-base">{jobDetails.company.about}</p>
              
              {jobDetails.company.website && (
                <a
                  href={jobDetails.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
                >
                  Visit Company Website <ExternalLink size={16} />
                </a>
              )}
            </div>
          )}

          {/* Sticky Apply Button for Desktop */}
          <div className="hidden lg:block sticky top-6">
            <button
              onClick={() => handleApplyClick()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md text-base md:text-lg"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobInfo;