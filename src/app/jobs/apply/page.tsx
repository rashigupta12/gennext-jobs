/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
declare module "html2pdf.js";

import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";

import { UploadDropzone } from "@/utils/uploadthing";
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Code,
  Download,
  FileText,
  GraduationCap,
  Info,
  Loader2,
  Mail,
  Plus,
  Upload,
  User,
  X,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Form validation schema - updated to make fields required properly

// 1. Update the form validation schema - replace the existing resume field:
// Alternative schema - simpler approach
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(10, "Please enter a valid phone number"),
  education: z.string().min(1, "Education is required"),
  experience: z.string().optional(),
  skills: z.string().min(1, "Please list your relevant skills"),
  resume: z.string().min(1, "Resume is required. Please upload your resume."),
  coverLetter: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// User type based on your schema
interface UserData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  resume?: {
    resumeUrl: string;
    education: string;
    experience: string;
    skills: string;
  };
  skills: string;
}

// Resume data interface
interface ResumeData {
  id: string;
  userId: string;
  resumeUrl: string;
  education: string;
  experience: string;
  skills: string;
  createdAt: string;
  updatedAt: string;
}

// Application interface
interface ApplicationData {
  id: string;
  userId: string;
  jobId: string;
  status: string;
  createdAt: string;
  appliedAt: string;
}

interface EducationEntry {
  college: string;
  degree: string;
  batch: string;
}

interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
}

const JobApplicationForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title");
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [jobId, setJobId] = useState("JOB-2025-03-001");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [userId, setuserId] = useState<string>("");
  const [resumeId, setresumeId] = useState<string>("");
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] =
    useState<ApplicationData | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const applicationRef = useRef<HTMLDivElement>(null);
  const [html2pdfModule, setHtml2pdfModule] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  // Multiple education and experience entries
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
    { college: "", degree: "", batch: "" },
  ]);
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>(
    [{ company: "", role: "", duration: "", responsibilities: "" }]
  );

  // Add refs for field sections
  const nameRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      education: "",
      experience: "",
      resume: undefined,
      coverLetter: "",
      skills: "",
    },
  });

  // Add this useEffect to sync educationEntries with form field
  useEffect(() => {
    const formattedEducation = formatEducationForDB(educationEntries);
    form.setValue("education", formattedEducation, { shouldValidate: true });
  }, [educationEntries, form]);

  // Add this useEffect to sync experienceEntries with form field
  useEffect(() => {
    const formattedExperience = formatExperienceForDB(experienceEntries);
    form.setValue("experience", formattedExperience, { shouldValidate: true });
  }, [experienceEntries, form]);

const scrollToFirstError = async () => {
  // Wait for form state to update
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const formState = form.formState;
  const errors = formState.errors;

  console.log("Current form errors:", errors);

  // Check fields in order and scroll to first error
  if (errors.name && nameRef.current) {
    console.log("Scrolling to name field");
    nameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }
  if (errors.email && emailRef.current) {
    console.log("Scrolling to email field");
    emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }
  if (errors.mobile && mobileRef.current) {
    console.log("Scrolling to mobile field");
    mobileRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }
  if (errors.education && educationRef.current) {
    console.log("Scrolling to education field");
    educationRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return true;
  }
  if (errors.skills && skillsRef.current) {
    console.log("Scrolling to skills field");
    skillsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }
  if (errors.resume && resumeRef.current) {
    console.log("Scrolling to resume field");
    resumeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    // Add a small offset to ensure the field is visible
    setTimeout(() => {
      window.scrollBy(0, -50);
    }, 500);
    return true;
  }
  
  return false;
};

  // Parse functions (same as profile page)
  const parseEducationData = (educationString: string): EducationEntry[] => {
    if (!educationString) return [{ college: "", degree: "", batch: "" }];

    try {
      const entries = educationString
        .split("|")
        .filter((entry) => entry.trim());
      return entries.map((entry) => {
        const parts = entry.split(",").map((part) => part.trim());
        return {
          college: parts[0] || "",
          degree: parts[1] || "",
          batch: parts[2] || "",
        };
      });
    } catch (e) {
      return [{ college: "", degree: "", batch: "" }];
    }
  };

  const parseExperienceData = (experienceString: string): ExperienceEntry[] => {
    if (!experienceString)
      return [{ company: "", role: "", duration: "", responsibilities: "" }];

    try {
      const entries = experienceString
        .split("|")
        .filter((entry) => entry.trim());
      return entries.map((entry) => {
        const parts = entry.split(",").map((part) => part.trim());
        return {
          company: parts[0] || "",
          role: parts[1] || "",
          duration: parts[2] || "",
          responsibilities: parts[3] || "",
        };
      });
    } catch (e) {
      return [{ company: "", role: "", duration: "", responsibilities: "" }];
    }
  };

  const formatEducationForDB = (entries: EducationEntry[]): string => {
    return entries
      .filter((entry) => entry.college || entry.degree || entry.batch)
      .map((entry) => `${entry.college},${entry.degree},${entry.batch}`)
      .join("|");
  };

  const formatExperienceForDB = (entries: ExperienceEntry[]): string => {
    return entries
      .filter(
        (entry) =>
          entry.company ||
          entry.role ||
          entry.duration ||
          entry.responsibilities
      )
      .map(
        (entry) =>
          `${entry.company},${entry.role},${entry.duration},${entry.responsibilities}`
      )
      .join("|");
  };

  // Education handlers
  const addEducationEntry = () => {
    setEducationEntries([
      ...educationEntries,
      { college: "", degree: "", batch: "" },
    ]);
  };

  const removeEducationEntry = (index: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(educationEntries.filter((_, i) => i !== index));
    }
  };

  const handleEducationChange = (
    index: number,
    field: keyof EducationEntry,
    value: string
  ) => {
    const updatedEntries = [...educationEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEducationEntries(updatedEntries);
  };

  // Experience handlers
  const addExperienceEntry = () => {
    setExperienceEntries([
      ...experienceEntries,
      { company: "", role: "", duration: "", responsibilities: "" },
    ]);
  };

  const removeExperienceEntry = (index: number) => {
    if (experienceEntries.length > 1) {
      setExperienceEntries(experienceEntries.filter((_, i) => i !== index));
    }
  };

  const handleExperienceChange = (
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) => {
    const updatedEntries = [...experienceEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setExperienceEntries(updatedEntries);
  };

  useEffect(() => {
    // Only load the module on the client side
    if (typeof window !== "undefined") {
      import("html2pdf.js")
        .then((module) => {
          setHtml2pdfModule(() => module.default);
        })
        .catch((err) => {
          console.error("Failed to load html2pdf.js module:", err);
        });
    }
  }, []);

  useEffect(() => {
    if (title) setJobTitle(title as string);
    if (id) setJobId(id as string);
  }, [title, id]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Job ID:", jobId);
      if (session?.user?.role === "USER" && session.user.id) {
        try {
          setIsLoading(true);
          const [userRes, resumeRes, applicationRes] = await Promise.all([
            fetch(`/api/users?Id=${session.user.id}`),
            fetch(`/api/resumes?userId=${session.user.id}`),
            fetch(
              `/api/application?jobIds=${id || jobId}&userId=${session.user.id}`
            ),
          ]);

          if (!userRes.ok || !resumeRes.ok || !applicationRes.ok) {
            throw new Error("Failed to fetch data from server");
          }

          const userData = await userRes.json();
          const resumeData = await resumeRes.json();
          const applicationData = await applicationRes.json();

          // Check if user has already applied for this job
          if (applicationData?.length > 0) {
            setHasApplied(true);
            setApplicationData(applicationData[0]);
          }

          // Store user ID from session
          const currentUserId = session.user.id;
          setuserId(currentUserId);

          // Find resume for the current user
          const userResume = resumeData.data?.find(
            (resume: ResumeData) => resume.userId === currentUserId
          );

          // Store the resume data and ID if found
          if (userResume) {
            const currentResumeId = userResume.id;
            setResumeData(userResume);
            setresumeId(currentResumeId);

            // Set resume URL and filename if available
            if (userResume.resumeUrl) {
              setResumeUrl(userResume.resumeUrl);
              setFileName(
                userResume.resumeUrl.split("/").pop() || "Uploaded Resume"
              );
              setResumeUploaded(true);
            }

            // Parse education and experience data
            if (userResume.education) {
              const parsedEducation = parseEducationData(userResume.education);
              setEducationEntries(
                parsedEducation.length > 0
                  ? parsedEducation
                  : [{ college: "", degree: "", batch: "" }]
              );
            }

            if (userResume.experience) {
              const parsedExperience = parseExperienceData(
                userResume.experience
              );
              setExperienceEntries(
                parsedExperience.length > 0
                  ? parsedExperience
                  : [
                      {
                        company: "",
                        role: "",
                        duration: "",
                        responsibilities: "",
                      },
                    ]
              );
            }
          } else {
            setResumeUrl(null);
            setFileName("");
            setResumeUploaded(false);
          }

          // Set user data and reset form with values
          if (userData?.data) {
            setUserData(userData.data);

            form.reset({
              name: userData.data.name || "",
              email: userData.data.email || "",
              mobile: userData.data.mobile || "",
              education: userResume?.education || "",
              experience: userResume?.experience || "",
              skills: userResume?.skills || "",
              resume: userResume?.resumeUrl || undefined,
              coverLetter: "",
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setFetchError(
            "Failed to load your profile data. Please try again later."
          );
          toast.error("Failed to load your profile data");
        } finally {
          setIsLoading(false);
        }
      } else if (status !== "loading") {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, jobId, id, status]);

const onSubmit: SubmitHandler<FormValues> = async (data) => {
  console.log("Form submission started with data:", data);

  if (hasApplied) {
    toast.error("You have already applied to this job");
    return;
  }

  setIsSubmitting(true);
  // let hasCustomErrors = false;

  try {
    // Clear any existing errors first
    form.clearErrors();

    // Custom validation for resume - check both field value and resumeUrl
    const hasResumeFile = resumeUrl && resumeUrl.trim() !== "";
    const hasResumeField = data.resume && data.resume.trim() !== "";
    
    if (!hasResumeFile && !hasResumeField) {
      console.log("Resume validation failed - no resume found");
      console.log("resumeUrl:", resumeUrl);
      console.log("data.resume:", data.resume);
      
      // Set the error and immediately scroll
      form.setError("resume", { 
        type: "required", 
        message: "Resume is required. Please upload your resume before submitting." 
      });
      
      toast.error("Resume is required. Please upload your resume before submitting.");
      
      // Immediate scroll to resume section
      if (resumeRef.current) {
        resumeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add extra scroll to ensure visibility
        setTimeout(() => {
          window.scrollBy(0, -80);
        }, 600);
      }
      
      setIsSubmitting(false);
      return;
    }

    // Custom validation for education
    const formattedEducation = formatEducationForDB(educationEntries);
    if (!formattedEducation) {
      console.log("Education validation failed");
      form.setError("education", { 
        type: "required", 
        message: "Please fill in at least one education entry." 
      });
      
      toast.error("Please fill in at least one education entry.");
      
      if (educationRef.current) {
        educationRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => window.scrollBy(0, -80), 600);
      }
      
      setIsSubmitting(false);
      return;
    }

    // Trigger standard form validation
    const isFormValid = await form.trigger();
    
    if (!isFormValid) {
      console.log("Form validation failed. Errors:", form.formState.errors);
      toast.error("Please fill in all required fields correctly");
      
      // Force scroll to error after state updates
      setTimeout(async () => {
        const scrolled = await scrollToFirstError();
        if (!scrolled) {
          console.log("No error field found to scroll to");
        }
      }, 300);
      
      setIsSubmitting(false);
      return;
    }

    // If we reach here, validation passed
    console.log("All validations passed, proceeding with submission");
    
    // Continue with your existing submission logic...
    const formattedExperience = formatExperienceForDB(experienceEntries);

    const formData = new FormData();
    formData.append("userId", userId);

    if (formattedEducation) formData.append("education", formattedEducation);
    if (formattedExperience) formData.append("experience", formattedExperience);
    if (data.skills) formData.append("skills", data.skills);

    if (typeof data.resume === "string" && data.resume.trim() !== "") {
      formData.append("resumeUrl", data.resume);
    }

    let currentResumeId = resumeId;
    let resumeResponse;

    console.log("Current Resume ID:", currentResumeId);
    if (currentResumeId) {
      resumeResponse = await fetch(`/api/resumes?id=${currentResumeId}`, {
        method: "PUT",
        body: formData,
      });
    } else {
      resumeResponse = await fetch(`/api/resumes`, {
        method: "POST",
        body: formData,
      });
    }

    if (!resumeResponse.ok) {
      const errorData = await resumeResponse.json();
      throw new Error(
        errorData.error || `Resume API error: ${resumeResponse.status}`
      );
    }

    const resumeResult = await resumeResponse.json();

    if (!currentResumeId && resumeResult.data?.id) {
      currentResumeId = resumeResult.data.id;
      setresumeId(currentResumeId);
    }

    const applicationResponse = await fetch(`/api/application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        jobId: id || jobId,
        resumeId: currentResumeId,
        coverLetter: data.coverLetter || "",
      }),
    });

    if (!applicationResponse.ok) {
      const errorData = await applicationResponse.json();
      throw new Error(
        errorData.error || `Application API error: ${applicationResponse.status}`
      );
    }

    const applicationResult = await applicationResponse.json();

    setSubmitSuccess(true);
    setApplicationData(applicationResult.data);
    setHasApplied(true);

    toast.success("Your job application has been submitted successfully!");
    router.push(`/dashboard/user`);

  } catch (error) {
    console.error("Error submitting application:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to submit your application. Please try again later.";
    setFetchError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  // Function to handle sign in when user is not authenticated
  const handleSignIn = async () => {
    await signIn();
  };

  // Function to generate and download PDF
  const downloadApplicationPDF = () => {
    if (!applicationRef.current || !html2pdfModule) {
      console.error("Application reference or html2pdf module not available");
      toast.error("Unable to generate PDF. Please try again later.");
      return;
    }

    try {
      const opt = {
        margin: 10,
        filename: `Job_Application_${jobId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Use the dynamically loaded module
      html2pdfModule()
        .from(applicationRef.current)
        .set(opt)
        .save()
        .then(() => {
          console.log("PDF generated successfully");
          toast.success("Your application PDF has been downloaded successfully.");
        })
        .catch((err: unknown) => {
          console.error("Error in PDF generation:", err);
          toast.error("Failed to generate PDF. Please try again.");
        });
    } catch (error) {
      console.error("Error in PDF generation process:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // Opens the PDF preview dialog
  const handleOpenPdfDialog = () => {
    setPdfDialogOpen(true);
  };

  // Parse skills for display
  const parseSkillsForDisplay = (skillsString: string): string[] => {
    if (!skillsString) return [];
    return skillsString
      .split(/[,\n]/)
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  };

  const validateEducationEntries = (): boolean => {
  const hasValidEducation = educationEntries.some(entry => 
    entry.college.trim() || entry.degree.trim() || entry.batch.trim()
  );
  
  if (!hasValidEducation) {
    form.setError("education", { 
      type: "required", 
      message: "Please fill in at least one education entry." 
    });
    return false;
  }
  
  // Check if any education entry has incomplete required fields
  const hasIncompleteEducation = educationEntries.some(entry => {
    const hasAnyField = entry.college.trim() || entry.degree.trim() || entry.batch.trim();
    const hasAllRequiredFields = entry.college.trim() && entry.degree.trim() && entry.batch.trim();
    return hasAnyField && !hasAllRequiredFields;
  });
  
  if (hasIncompleteEducation) {
    form.setError("education", { 
      type: "validation", 
      message: "Please complete all fields for each education entry or remove incomplete entries." 
    });
    return false;
  }
  
  return true;
};

// Fix 5: Enhanced resume validation
const validateResumeField = (): boolean => {
  if (!resumeUrl && (!form.getValues("resume") || form.getValues("resume")?.trim() === "")) {
    form.setError("resume", { 
      type: "required", 
      message: "Resume is required. Please upload your resume." 
    });
    return false;
  }
  return true;
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-20 ">
          <div className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-lg text-blue-700">
              Loading application form...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log(applicationData);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="min-h-screen bg-white pt-20 pb-4">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-1 text-center">
            <h1 className="text-xl font-bold text-gray-800 capitalize">{jobTitle}</h1>
          </div>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm">
            {/* Status Messages */}
            {status === "unauthenticated" && (
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <div className="flex flex-col sm:flex-row items-center justify-between max-w-3xl mx-auto gap-3">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-blue-600 mr-3" />
                    <p className="text-gray-700 text-sm sm:text-base">
                      Sign in to access your profile data and make applying
                      easier.
                    </p>
                  </div>
                  <Button
                    onClick={handleSignIn}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {fetchError && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2">
                <Alert className="bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Error</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {fetchError}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Already Applied Alert */}
            {hasApplied && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2">
                <Alert className="bg-blue-50 border border-blue-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <AlertTitle className="text-blue-800 font-medium mb-1 text-sm sm:text-base">
                        Application Already Submitted
                      </AlertTitle>
                      <AlertDescription className="text-blue-700 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            You have already applied for this position on{" "}
                            {new Date(
                              applicationData?.appliedAt || ""
                            ).toLocaleDateString()}
                            . Your application is currently{" "}
                            <span className="font-medium">
                              {applicationData?.status || "under review"}
                            </span>
                            .
                          </div>
                          <Button
                            onClick={handleOpenPdfDialog}
                            className="bg-blue-700 hover:bg-blue-800 text-white text-sm flex items-center"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" /> Download
                          </Button>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            {/* Success Message */}
            {submitSuccess && !hasApplied && (
              <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                <Alert className="bg-green-50 border border-green-200">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <AlertTitle className="text-green-800 font-semibold mb-1 text-sm sm:text-base">
                        Application Submitted Successfully
                      </AlertTitle>
                      <AlertDescription className="text-green-700 text-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            Your application has been received. Our team will
                            review it and get back to you soon.
                          </div>
                          <Button
                            onClick={handleOpenPdfDialog}
                            className="mt-3 sm:mt-0 bg-green-700 hover:bg-green-800 text-white text-sm"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" /> Download
                          </Button>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            {userData && !fetchError && !hasApplied && (
              <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">
                    Welcome back,{" "}
                    <span className="font-semibold">{userData.name}</span>!
                    We&apos;ve pre-filled some information from your profile
                    {resumeData ? " and resume" : ""}.
                  </p>
                </div>
              </div>
            )}

            <CardContent className="p-4 sm:p-4 py-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div ref={nameRef} className="bg-gray-50 p-4 sm:p-4 pb-2 rounded-lg">
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-gray-800">
                          <User className="h-5 w-5 text-blue-600" />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem ref={nameRef}>
      <FormLabel className="text-sm font-medium text-gray-700">
        Full Name *
      </FormLabel>
      <FormControl>
        <Input
          className="mt-1 capitalize text-sm sm:text-base"
          placeholder="John Doe"
          {...field}
          disabled
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


                          <div ref={emailRef}>
                            <FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem ref={emailRef}>
      <FormLabel className="text-sm font-medium text-gray-700">
        Email *
      </FormLabel>
      <FormControl>
        <Input
          className="mt-1 text-sm sm:text-base"
          type="email"
          placeholder="example@example.com"
          {...field}
          disabled
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
                          </div>

                          <div ref={mobileRef}>
                            <FormField
  control={form.control}
  name="mobile"
  render={({ field }) => (
    <FormItem ref={mobileRef}>
      <FormLabel className="text-sm font-medium text-gray-700">
        Phone *
      </FormLabel>
      <FormControl>
        <Input
          className="mt-1 text-sm sm:text-base"
          type="tel"
          placeholder="123-456-7890"
          {...field}
          disabled
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
                          </div>
                        </div>
                      </div>

                      {/* Multiple Education Entries */}
                      <div ref={educationRef} className="bg-gray-50 p-4 sm:p-4 py-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            Education
                          </h3>

                          {!hasApplied && (
                            <Button
                              type="button"
                              onClick={addEducationEntry}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                            >
                              <Plus className="h-4 w-4 " />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4 sm:space-y-4">
                          {educationEntries.map((entry, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 relative"
                            >
                              {educationEntries.length > 1 && !hasApplied && (
                                <Button
                                  type="button"
                                  onClick={() => removeEducationEntry(index)}
                                  size="sm"
                                  variant="outline"
                                  className="absolute top-2 right-2 text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}

                              <div className="space-y-3 sm:space-y-4 pr-6 sm:pr-8">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    College/University Name *
                                  </Label>
                                  <Input
                                    value={entry.college}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        index,
                                        "college",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter your college or university name"
                                    className="mt-1 capitalize text-sm sm:text-base"
                                    disabled={hasApplied}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Degree/Course *
                                  </Label>
                                  <Input
                                    value={entry.degree}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        index,
                                        "degree",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., B.Tech Computer Science, MBA, etc."
                                    className="mt-1 capitalize text-sm sm:text-base"
                                    disabled={hasApplied}
                                  />
                                </div>
                               <div>
  <Label className="text-sm font-medium text-gray-700">
    Passing Year *
  </Label>
  <Input
    type="text"
    value={entry.batch}
    onChange={(e) => {
      const value = e.target.value;
      
      // Allow only digits and limit to 4 characters
      if (/^\d{0,4}$/.test(value)) {
        // Allow empty string or incomplete years (1, 2, 3 digits)
        if (value === "" || value.length < 4) {
          handleEducationChange(index, "batch", value);
        } 
        // For complete 4-digit years, validate the range
        else if (value.length === 4) {
          const year = parseInt(value);
          if (year >= 1900 && year <= 2099) {
            handleEducationChange(index, "batch", value);
          }
          // If invalid year, don't update (this prevents typing invalid complete years)
        }
      }
    }}
    onBlur={(e) => {
      // Validate on blur for incomplete entries
      const value = e.target.value;
      if (value.length > 0 && value.length < 4) {
        // Could show a warning or clear invalid partial entries
        console.log("Incomplete year entered:", value);
      }
    }}
    placeholder="e.g., 2024"
    className="mt-1 text-sm sm:text-base"
    disabled={hasApplied}
    maxLength={4}
  />
</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Multiple Experience Entries */}
                      <div className="bg-gray-50 p-4 sm:p-4 py-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            Work Experience
                          </h3>

                          {!hasApplied && (
                            <Button
                              type="button"
                              onClick={addExperienceEntry}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                            >
                              <Plus className="h-4 w-4 " />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                          {experienceEntries.map((entry, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 relative"
                            >
                              {experienceEntries.length > 1 && !hasApplied && (
                                <Button
                                  type="button"
                                  onClick={() => removeExperienceEntry(index)}
                                  size="sm"
                                  variant="outline"
                                  className="absolute top-2 right-2 text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}

                              <div className="space-y-3 sm:space-y-4 pr-6 sm:pr-6">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Company Name
                                  </Label>
                                  <Input
                                    value={entry.company}
                                    onChange={(e) =>
                                      handleExperienceChange(
                                        index,
                                        "company",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter company name"
                                    className="mt-1 capitalize text-sm sm:text-base"
                                    disabled={hasApplied}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Job Role/Position
                                  </Label>
                                  <Input
                                    value={entry.role}
                                    onChange={(e) =>
                                      handleExperienceChange(
                                        index,
                                        "role",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., Software Developer, Marketing Manager"
                                    className="mt-1 capitalize text-sm sm:text-base"
                                    disabled={hasApplied}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Duration
                                  </Label>
                                  <Input
                                    value={entry.duration}
                                    onChange={(e) =>
                                      handleExperienceChange(
                                        index,
                                        "duration",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., Jan 2020 - Dec 2022, 2 years"
                                    className="mt-1 text-sm sm:text-base"
                                    disabled={hasApplied}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Key Responsibilities
                                  </Label>
                                  <Textarea
                                    value={entry.responsibilities}
                                    onChange={(e) =>
                                      handleExperienceChange(
                                        index,
                                        "responsibilities",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Describe your key responsibilities and achievements"
                                    className="mt-1 min-h-[80px] text-sm sm:text-base"
                                    disabled={hasApplied}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Skills Section */}
                      <div ref={skillsRef} className="bg-gray-50 p-4 sm:p-4 rounded-lg">
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-gray-800">
                          <Code className="h-5 w-5 text-blue-600" />
                          Skills & Technologies
                        </h3>
                        <FormField
                          control={form.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Technical Skills *
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  className="mt-1 min-h-[50px] text-sm sm:text-base"
                                  placeholder="List your relevant skills (e.g., JavaScript, React, Node.js, Python, etc.)"
                                  {...field}
                                  disabled={hasApplied}
                                />
                              </FormControl>
                              <FormDescription className="text-gray-600 text-xs sm:text-sm">
                                Separate skills with commas or line breaks
                              </FormDescription>

                              {/* Skills Preview */}
                              {field.value &&
                                parseSkillsForDisplay(field.value).length >
                                  0 && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex flex-wrap gap-2">
                                      {parseSkillsForDisplay(field.value).map(
                                        (skill, index) => (
                                          <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize"
                                          >
                                            {skill}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Resume Upload Section */}


<div ref={resumeRef} className="bg-gray-50 p-4 sm:p-4 rounded-lg">
  <div className="flex items-center justify-between mb-4 sm:mb-6">
    <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800">
      <FileText className="h-5 w-5 text-blue-600" />
      Resume/CV *
    </h3>
    {resumeUrl && (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.open(resumeUrl, "_blank")}
        className="text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
      >
        View
      </Button>
    )}
  </div>

  {/* Resume Status Display */}
  {resumeUploaded && resumeUrl && (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800">
          Resume Uploaded Successfully
        </p>
        <p className="text-xs text-green-600">
          {fileName}
        </p>
      </div>
    </div>
  )}

  {!hasApplied && (
    <div className="mt-4">
      <FormField
        control={form.control}
        name="resume"
        render={({ field: { onChange, ...field } }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              {resumeUploaded ? "Update Resume *" : "Upload Resume *"}
            </FormLabel>
            <FormControl>
              <div className="mt-2">
                {isUploading ? (
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="docUploader"
                    onBeforeUploadBegin={(files) => {
                      setIsUploading(true);
                      return files;
                    }}
                    onClientUploadComplete={(res) => {
                      if (res && res.length > 0) {
                        const fileUrl = res[0].serverData.fileUrl;
                        const uploadedFileName = res[0].name;
                        setResumeUrl(fileUrl);
                        setFileName(uploadedFileName);
                        setResumeUploaded(true);
                        onChange(fileUrl);

                        // Clear any existing resume error
                        form.clearErrors("resume");

                        toast.success("Resume uploaded successfully");
                      }
                      setIsUploading(false);
                    }}
                    onUploadError={(error: Error) => {
                      console.error("Upload error:", error);
                      setFetchError("Failed to upload resume. Please try again.");
                      setIsUploading(false);
                      toast.error("Failed to upload resume. Please try again.");
                    }}
                    className="ut-button:bg-blue-600 ut-button:hover:bg-blue-700"
                  />
                )}
              </div>
            </FormControl>
            <FormDescription className="text-gray-600">
              {resumeUploaded
                ? "Upload a new file to replace your current resume (PDF preferred) - Required"
                : "Upload your resume (PDF preferred) - Required"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )}
</div>

                      {/* Cover Letter Section */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                          <Mail className="h-5 w-5 text-blue-600" />
                          Cover Letter (Optional)
                        </h3>
                        <FormField
                          control={form.control}
                          name="coverLetter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Cover Letter
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  className="mt-1 min-h-[150px]"
                                  placeholder="Write a brief cover letter explaining why you're interested in this position and what you can bring to the role..."
                                  {...field}
                                  disabled={hasApplied}
                                />
                              </FormControl>
                              <FormDescription className="text-gray-600">
                                Tell us why you &apos;re the perfect fit for this role
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  {!hasApplied && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          type="submit"
                          disabled={isSubmitting || isUploading}
                          className="bg-gradient-to-r from-gennext to-gennext-dark hover:from-blue-700 hover:to-purple-800 text-white px-8 py-3 text-lg font-semibold min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-5 w-5" />
                              Submit Application
                            </>
                          )}
                        </Button>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => router.push("/jobs")}
                                  className="px-8 py-3 text-lg min-w-[200px]"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Return to job listings</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Validation Messages */}

                      {/* Updated validation messages */}
                      <div className="mt-4 space-y-2">
                        {isUploading && (
                          <div className="text-center">
                            <p className="text-sm text-blue-600 flex items-center justify-center">
                              <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />
                              Please wait while your resume is uploading...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Preview</DialogTitle>
          </DialogHeader>

          <div ref={applicationRef} className="p-6 bg-white">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Job Application
              </h1>
              <div className="text-gray-600">
                <p className="text-lg font-semibold">{jobTitle}</p>
                <p>Reference: {jobId}</p>
                <p>
                  Applied:{" "}
                  {applicationData
                    ? new Date(applicationData.createdAt).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Name:</p>
                    <p className="text-gray-600">{form.getValues("name")}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Email:</p>
                    <p className="text-gray-600">{form.getValues("email")}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Phone:</p>
                    <p className="text-gray-600">{form.getValues("mobile")}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Education
                </h2>
                <div className="space-y-3">
                  {educationEntries.map((entry, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{entry.degree}</p>
                      <p className="text-gray-600">{entry.college}</p>
                      <p className="text-sm text-gray-500">{entry.batch}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {experienceEntries.map((entry, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{entry.role}</h3>
                        <span className="text-sm text-gray-500">
                          {entry.duration}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{entry.company}</p>
                      <p className="text-sm text-gray-700">
                        {entry.responsibilities}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {parseSkillsForDisplay(form.getValues("skills")).map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              {form.getValues("coverLetter") && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Cover Letter
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {form.getValues("coverLetter")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={downloadApplicationPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JobApplicationForm;