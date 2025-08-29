// DetailView.tsx
/* eslint-disable @typescript-eslint/no-unused-vars*/
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { JobApplicationView, JobListing } from "@/types";
import { fetchJobDetails } from "@/api";
import Image from "next/image";

interface DetailViewProps {
  application: JobApplicationView | null;
  onClose: () => void;
}

export const DetailView = ({ application, onClose }: DetailViewProps) => {
  const [jobDetails, setJobDetails] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!application) return;
      
      setLoading(true);
      try {
        // We already have basic job data, but might want to fetch more comprehensive details
        // You can modify this to use the existing job data if it's sufficient
        const jobData = await fetchJobDetails([application.job.id]);
        if (jobData && jobData.length > 0) {
          setJobDetails(jobData[0]);
        } else {
          // Fallback to the job data we already have
          setJobDetails(application.job);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again later.");
        // Fallback to the job data we already have
        setJobDetails(application.job);
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [application]);

  if (!application) return null;

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="sticky top-0 z-10 bg-background border-b flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl font-bold">{application.job.title}</CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {application.company.name} • {application.job.location}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-base">Application Status</h3>
          <div className="flex items-center">
            <Badge 
              style={{ 
                backgroundColor: application.status.color + '20', 
                color: application.status.color,
                borderColor: application.status.color
              }}
              variant="outline"
              className="px-3 py-1"
            >
              {application.status.name}
            </Badge>
            <span className="ml-4 text-sm text-muted-foreground">
              Applied on {formatDate(application.application.appliedAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Job Type</span>
            <p>{application.job.employmentType}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Category</span>
            <p>{application.category.name}</p>
          </div>
          {application.job.salary && (
            <div>
              <span className="text-muted-foreground">Salary</span>
              <p>{application.job.salary}</p>
            </div>
          )}
          {/* {application.job.experienceLevel && (
            <div>
              <span className="text-muted-foreground">Experience</span>
              <p>{application.job.experienceLevel()}</p>
            </div>
          )} */}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Job Description</h3>
              <div className="text-sm text-muted-foreground" 
                dangerouslySetInnerHTML={{ __html: application.job.description || "No description available" }}>
              </div>
            </div>

            {application.job.highlights && application.job.highlights.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Highlights</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {application.job.highlights.map((highlight: string, index: number) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}

            {application.job.qualifications && application.job.qualifications.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Qualifications</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {application.job.qualifications.map((qualification: string, index: number) => (
                    <li key={index}>{qualification}</li>
                  ))}
                </ul>
              </div>
            )}

            {application.job.skills && application.job.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {application.job.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {application.company && (
              <div className="space-y-2">
                <h3 className="font-semibold text-base">About the Company</h3>
                <div className="flex items-center gap-3 mb-2">
                  {application.company.logo ? (
                    <Image 
                      src={application.company.logo} 
                      alt={application.company.name} 
                      className="h-10 w-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {application.company.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{application.company.name}</div>
                    {application.company.industry && (
                      <div className="text-sm text-muted-foreground">{application.company.industry}</div>
                    )}
                  </div>
                </div>
                {application.company.about && (
                  <p className="text-sm text-muted-foreground">{application.company.about}</p>
                )}
                {application.company.website && (
                  <a 
                    href={application.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit company website
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="border-t p-4 flex justify-end gap-2 bg-background sticky bottom-0">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};