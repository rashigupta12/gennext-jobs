"use client";

import Image from "next/image";
import React from "react";

interface JobCardProps {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  salary?: string | { min: number; max: number };
  postedAt: string;
  isFeatured?: boolean;
  companyName?: string;
  companyLogo?: string;
}

const JobCard = ({
  id,
  title,
  location,
  employmentType,
  salary,
  postedAt,
  isFeatured = false,
  companyName,
  companyLogo,
}: JobCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        {isFeatured && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
            Featured
          </span>
        )}
      </div>
      
      {companyName && (
        <div className="mt-2 flex items-center text-gray-700">
          {companyLogo ? (
            <div className="w-6 h-6 mr-2 rounded-full overflow-hidden flex-shrink-0">
              <Image src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-6 h-6 mr-2 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium">{companyName.charAt(0)}</span>
            </div>
          )}
          <span>{companyName}</span>
        </div>
      )}
      
      <div className="mt-2 text-gray-600">
        <p className="flex items-center">
          <svg
            className="h-4 w-4 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
          </svg>
          {location}
        </p>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
          {employmentType.replace("_", " ")}
        </span>
        {salary && (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            {typeof salary === "object"
              ? `$${salary.min.toLocaleString()}-$${salary.max.toLocaleString()}`
              : salary}
          </span>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Posted {new Date(postedAt).toLocaleDateString()}
        </span>
        <a
          href={`/jobs/${id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
        >
          View Details
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default JobCard;