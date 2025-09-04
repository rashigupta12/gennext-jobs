/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { capitalizeFirstLetter } from "@/lib/helper";
import { UploadButton } from "@/utils/uploadthing";
import {
  Briefcase,
  Code,
  FileText,
  GraduationCap,
  User,
  Phone,
  Mail,
  Building,
  Plus,
  X,
  Target,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  profile?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Resume {
  id?: string;
  userId: string;
  resumeUrl: string;
  experience: string;
  skills: string;
  education: string;
  position: string;
  createdAt?: string;
  updatedAt?: string;
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
interface ProfileFormData extends Partial<Resume> {
  mobile?: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    resumeUrl: "",
    experience: "",
    skills: "",
    education: "",
    position: "",
    mobile: "",
  });

  // Multiple education entries
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
    { college: "", degree: "", batch: "" },
  ]);

  // Multiple experience entries
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>(
    [{ company: "", role: "", duration: "", responsibilities: "" }]
  );

  // Helper function to clean text content (remove quotes and parse JSON if needed)
  const cleanTextContent = (text: string | null | undefined): string => {
    if (!text) return "";

    // Convert to string if it's not already
    let cleanText = String(text);

    // Remove leading/trailing quotes
    if (
      (cleanText.startsWith('"') && cleanText.endsWith('"')) ||
      (cleanText.startsWith("'") && cleanText.endsWith("'"))
    ) {
      cleanText = cleanText.slice(1, -1);
    }

    // Try to parse as JSON if it looks like JSON
    if (cleanText.startsWith("{") || cleanText.startsWith("[")) {
      try {
        const parsed = JSON.parse(cleanText);
        return typeof parsed === "string" ? parsed : JSON.stringify(parsed);
      } catch (e) {
        // If parsing fails, return the cleaned text
        return cleanText;
      }
    }

    return cleanText;
  };

  // Function to parse education data from comma-separated format
  const parseEducationData = (educationString: string): EducationEntry[] => {
    const cleanedString = cleanTextContent(educationString);
    if (!cleanedString) return [{ college: "", degree: "", batch: "" }];

    try {
      const entries = cleanedString.split("|").filter((entry) => entry.trim());
      if (entries.length === 0) return [{ college: "", degree: "", batch: "" }];

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

  // Function to parse experience data from comma-separated format
  const parseExperienceData = (experienceString: string): ExperienceEntry[] => {
    const cleanedString = cleanTextContent(experienceString);
    if (!cleanedString)
      return [{ company: "", role: "", duration: "", responsibilities: "" }];

    try {
      const entries = cleanedString.split("|").filter((entry) => entry.trim());
      if (entries.length === 0)
        return [{ company: "", role: "", duration: "", responsibilities: "" }];

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

  // Function to convert education entries to comma-separated format
  const formatEducationForDB = (entries: EducationEntry[]): string => {
    return entries
      .filter(
        (entry) =>
          entry.college.trim() || entry.degree.trim() || entry.batch.trim()
      )
      .map(
        (entry) =>
          `${entry.college.trim()},${entry.degree.trim()},${entry.batch.trim()}`
      )
      .join("|");
  };

  // Function to convert experience entries to comma-separated format
  const formatExperienceForDB = (entries: ExperienceEntry[]): string => {
    return entries
      .filter(
        (entry) =>
          entry.company.trim() ||
          entry.role.trim() ||
          entry.duration.trim() ||
          entry.responsibilities.trim()
      )
      .map(
        (entry) =>
          `${entry.company.trim()},${entry.role.trim()},${entry.duration.trim()},${entry.responsibilities.trim()}`
      )
      .join("|");
  };

  // Function to parse and clean skills
  const parseSkills = (skillsString: string): string[] => {
    const cleanedString = cleanTextContent(skillsString);
    if (!cleanedString) return [];

    return cleanedString
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0); // Remove empty strings
  };

  // Function to parse and clean positions (same as skills)
  const parsePositions = (positionsString: string): string[] => {
    const cleanedString = cleanTextContent(positionsString);
    if (!cleanedString) return [];

    return cleanedString
      .split(",")
      .map((position) => position.trim())
      .filter((position) => position.length > 0); // Remove empty strings
  };

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?Id=${id}`);
      const userData = await response.json();

      if (userData.success && userData.data) {
        setUser(userData.data);

        // Fetch resume data
        const resumeResponse = await fetch(`/api/resumes?userId=${id}`);
        const resumeData = await resumeResponse.json();

        if (
          resumeData.success &&
          resumeData.data &&
          resumeData.data.length > 0
        ) {
          const fetchedResume = resumeData.data[0];

          // Clean the fetched data
          const cleanedResume = {
            ...fetchedResume,
            experience: cleanTextContent(fetchedResume.experience),
            education: cleanTextContent(fetchedResume.education),
            skills: cleanTextContent(fetchedResume.skills),
            position: cleanTextContent(fetchedResume.position),
          };

          setResume(cleanedResume);
          setFormData({
            resumeUrl: cleanedResume.resumeUrl || "",
            experience: cleanedResume.experience || "",
            skills: cleanedResume.skills || "",
            education: cleanedResume.education || "",
            position: cleanedResume.position || "",
            mobile: userData.data.mobile || "", // Add this
          });

          // Parse education and experience data
          if (cleanedResume.education) {
            const parsedEducation = parseEducationData(cleanedResume.education);
            setEducationEntries(
              parsedEducation.length > 0
                ? parsedEducation
                : [{ college: "", degree: "", batch: "" }]
            );
          }

          if (cleanedResume.experience) {
            const parsedExperience = parseExperienceData(
              cleanedResume.experience
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
          setResume(null);
          setFormData({
            resumeUrl: "",
            experience: "",
            skills: "",
            education: "",
            position: "",
          });
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchUserData();
  }, [id, fetchUserData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter(value),
    }));
  };

  // Add new education entry
  const addEducationEntry = () => {
    setEducationEntries([
      ...educationEntries,
      { college: "", degree: "", batch: "" },
    ]);
  };

  // Remove education entry
  const removeEducationEntry = (index: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(educationEntries.filter((_, i) => i !== index));
    }
  };

  // Handle education entry change
  const handleEducationChange = (
    index: number,
    field: keyof EducationEntry,
    value: string
  ) => {
    const updatedEntries = [...educationEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: capitalizeFirstLetter(value),
    };
    setEducationEntries(updatedEntries);
  };

  // Add new experience entry
  const addExperienceEntry = () => {
    setExperienceEntries([
      ...experienceEntries,
      { company: "", role: "", duration: "", responsibilities: "" },
    ]);
  };

  // Remove experience entry
  const removeExperienceEntry = (index: number) => {
    if (experienceEntries.length > 1) {
      setExperienceEntries(experienceEntries.filter((_, i) => i !== index));
    }
  };

  const updateMobileNumber = async (newMobile: string) => {
    try {
      const response = await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?.id,
          mobile: newMobile,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setUser((prev) => (prev ? { ...prev, mobile: newMobile } : null));
        return true;
      } else {
        throw new Error(result.message || "Failed to update mobile");
      }
    } catch (error) {
      console.error("Error updating mobile:", error);
      return false;
    }
  };

  // Handle experience entry change
  const handleExperienceChange = (
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) => {
    const updatedEntries = [...experienceEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: capitalizeFirstLetter(value),
    };
    setExperienceEntries(updatedEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Add this before the resume submission logic
    if (formData.mobile !== user?.mobile) {
      await updateMobileNumber(formData.mobile || "");
    }

    try {
      const submitData = new FormData();

      // Format education and experience data
      const formattedEducation = formatEducationForDB(educationEntries);
      const formattedExperience = formatExperienceForDB(experienceEntries);

      // Add form data to FormData object
      submitData.append("resumeUrl", formData.resumeUrl || "");
      submitData.append("experience", formattedExperience);
      submitData.append("skills", formData.skills || "");
      submitData.append("education", formattedEducation);
      submitData.append("position", formData.position || "");
      submitData.append("userId", id);

      let response;
      if (resume?.id) {
        console.log("resume id ", resume.id);
        response = await fetch(`/api/resumes/${resume.id}`, {
          method: "PUT",
          body: submitData,
        });
      } else {
        response = await fetch("/api/resumes", {
          method: "POST",
          body: submitData,
        });
      }

      const result = await response.json();

      if (response.ok) {
        console.log("Resume saved successfully:", result);
        fetchUserData();
        setIsEditing(false);
      } else {
        throw new Error(result.message || "Failed to save resume");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="space-y-6 w-full max-w-6xl px-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-20 pb-4">
        <div className="container mx-auto px-4  ">
          <Card className="shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gennext to-gennext-dark text-white rounded-t-lg capitalize">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.name}
                  </CardTitle>
                  <CardDescription className="text-blue-100 mt-2">
                    {user?.email}
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "secondary" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                  className={`mt-4 md:mt-0 ${
                    isEditing
                      ? "bg-white text-blue-600 hover:bg-gray-100"
                      : "border-white text-gennext hover:bg-white hover:text-blue-600"
                  }`}
                  size="lg"
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 py-4">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div className="bg-gray-50 p-6 pb-2 rounded-lg">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                          <User className="h-5 w-5 text-blue-600" />
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="mobile"
                              className="text-sm font-medium text-gray-700"
                            >
                              Mobile Number
                            </Label>
                            <Input
                              id="mobile"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleInputChange}
                              placeholder="Enter your mobile number"
                              maxLength={10}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Position/Job Preferences */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                          <Target className="h-5 w-5 text-blue-600" />
                          Job Preferences
                        </h3>
                        <div>
                          <Label
                            htmlFor="position"
                            className="text-sm font-medium text-gray-700"
                          >
                            Desired Positions/Roles *
                          </Label>
                          <Textarea
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            placeholder="List the job positions or roles you're interested in.&#10;&#10;Example:&#10;Software Engineer, Full Stack Developer, Frontend Developer, Backend Developer, DevOps Engineer"
                            rows={4}
                            className="mt-1 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Separate different positions with commas
                          </p>
                        </div>
                      </div>

                      {/* Multiple Education Entries */}
                      <div className="bg-gray-50 px-6 py-4 rounded-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            Education Details
                          </h3>
                          <Button
                            type="button"
                            onClick={addEducationEntry}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                           
                          </Button>
                        </div>

                        <div className="space-y-6">
                          {educationEntries.map((entry, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-gray-200 relative"
                            >
                              {educationEntries.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeEducationEntry(index)}
                                  size="sm"
                                  variant="outline"
                                  className="absolute top-2 right-2 text-red-600 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}

                              <div className="space-y-4 pr-8">
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
                                    className="mt-1 capitalize"
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
                                    placeholder="B.Tech (cse)"
                                    className="mt-1 capitalize"
                                  />
                                </div>
                               <div>
  <Label className="text-sm font-medium text-gray-700">
    Passing Year *
  </Label>
  <Input
    type="text" // 👈 use "text" instead of "number" so we can fully control validation
    inputMode="numeric" // still shows numeric keypad on mobile
    value={entry.batch}
    onChange={(e) => {
      const value = e.target.value;

      // Allow only digits (no minus sign, no letters) and max 4 characters
      if (/^\d{0,4}$/.test(value)) {
        if (value === "" || value.length < 4) {
          handleEducationChange(index, "batch", value);
        } else if (value.length === 4) {
          const year = parseInt(value, 10);
          if (year >= 1900 && year <= 2099) {
            handleEducationChange(index, "batch", value);
          }
        }
      }
    }}
    placeholder="2024"
    className="mt-1 capitalize"
  />
</div>

                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resume Upload */}
<div className="bg-gray-50 px-6 py-2 rounded-lg">
  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
    <FileText className="h-5 w-5 text-blue-600" />
    Resume Document
  </h3>
  <div className="space-y-4">
    <div>
      <Label
        htmlFor="resumeUrl"
        className="text-sm font-medium text-gray-700"
      >
        Resume Link 
      </Label>
      <Input
        id="resumeUrl"
        name="resumeUrl"
        value={formData.resumeUrl}
        onChange={handleInputChange}
        placeholder="Paste your resume link here"
        className="mt-1"
      />
    </div>
    <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-6">
      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600 mb-2">
        Or upload your resume
      </p>
      <div className="upload-button-container">
        <UploadButton
          endpoint="docUploader"
          appearance={{
            button:
              "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md",
            allowedContent: "hidden", // This might help
          }}
          onClientUploadComplete={(res) => {
            if (res && res.length > 0) {
              const fileUrl = res[0].serverData.fileUrl;
              setFormData((prev) => ({
                ...prev,
                resumeUrl: fileUrl,
              }));
            }
          }}
          onUploadError={(error: Error) => {
            console.error("Error uploading resume:", error);
          }}
        />
      </div>
    </div>
  </div>
</div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      {/* Multiple Work Experience Entries */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            Work Experience
                          </h3>
                          <Button
                            type="button"
                            onClick={addExperienceEntry}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                           
                          </Button>
                        </div>

                        <div className="space-y-6">
                          {experienceEntries.map((entry, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-gray-200 relative"
                            >
                              {experienceEntries.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeExperienceEntry(index)}
                                  size="sm"
                                  variant="outline"
                                  className="absolute top-2 right-2 text-red-600 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}

                              <div className="space-y-4 pr-8">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Company Name *
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
                                    className="mt-1 capitalize"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Role/Position *
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
                                    placeholder="e.g., Software Developer, Manager, etc."
                                    className="mt-1 capitalize"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Duration *
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
                                    placeholder="e.g., Jan 2020 - Dec 2022 or 2 years"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Key Responsibilities *
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
                                    placeholder="Describe your key responsibilities and achievements..."
                                    rows={4}
                                    className="mt-1 resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                          <Code className="h-5 w-5 text-blue-600" />
                          Technical Skills
                        </h3>
                        <div>
                          <Label
                            htmlFor="skills"
                            className="text-sm font-medium text-gray-700"
                          >
                            Skills & Technologies *
                          </Label>
                          <Textarea
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            onChange={handleInputChange}
                            placeholder="List your technical skills, programming languages, tools, and technologies.&#10;&#10;Example:&#10;Programming: JavaScript, Python, Java&#10;Frameworks: React, Node.js, Django&#10;Tools: Git, Docker, AWS&#10;Databases: MySQL, MongoDB"
                            rows={6}
                            className="mt-1 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Separate skills with commas or organize by
                            categories
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-8 border-t">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 text-lg"
                    >
                      {isSubmitting
                        ? "Saving Profile..."
                        : resume?.id
                        ? "Update Profile"
                        : "Save Profile"}
                    </Button>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="space-y-8">
                  {!resume ? (
                    <div className="text-center py-16">
                      <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Complete Your Profile
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Add your professional information to make your profile
                        stand out to employers
                      </p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 text-lg"
                        size="lg"
                      >
                        Add Profile Information
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - View Mode */}
                      <div className="space-y-6">
                        {/* Personal Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <User className="h-5 w-5 text-blue-600" />
                            Personal Information
                          </h3>
                          <div className="space-y-3 capitalize">
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-700">
                                Name:
                              </span>
                              <span className="text-gray-600">
                                {user?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-700">
                                Email:
                              </span>
                              <span className="text-gray-600">
                                {user?.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-700">
                                Mobile:
                              </span>
                              <span className="text-gray-600">
                                {user?.mobile || "Not provided"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Job Preferences */}
                        {resume.position && (
                          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-lg border border-teal-100">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                              <Target className="h-5 w-5 text-teal-600" />
                              Job Preferences
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {parsePositions(resume.position).map(
                                (position, index) => (
                                  <span
                                    key={index}
                                    className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm capitalize"
                                  >
                                    {position}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Education - Display All Entries */}
                        {resume.education && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                              <GraduationCap className="h-5 w-5 text-green-600" />
                              Education
                            </h3>
                            <div className="space-y-4">
                              {parseEducationData(resume.education).map(
                                (entry, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border border-green-200"
                                  >
                                    <div className="text-gray-700 leading-relaxed capitalize space-y-1">
                                      <div>
                                        <strong>Institution:</strong>{" "}
                                        {entry.college}
                                      </div>
                                      <div>
                                        <strong>Degree:</strong> {entry.degree}
                                      </div>
                                      <div>
                                        <strong>Year:</strong> {entry.batch}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Resume Document */}
                        {resume.resumeUrl && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                              <FileText className="h-5 w-5 text-purple-600" />
                              Resume Document
                            </h3>
                            <a
                              href={resume.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-md transition-all font-medium"
                            >
                              <FileText className="h-4 w-4" />
                              View Resume Document
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right Column - View Mode */}
                      <div className="space-y-6">
                        {/* Work Experience - Display All Entries */}
                        {resume.experience && (
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-100">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                              <Briefcase className="h-5 w-5 text-orange-600" />
                              Work Experience
                            </h3>
                            <div className="space-y-4">
                              {parseExperienceData(resume.experience).map(
                                (entry, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border border-orange-200"
                                  >
                                    <div className="text-gray-700 leading-relaxed capitalize space-y-2">
                                      <div>
                                        <strong>Company:</strong>{" "}
                                        {entry.company}
                                      </div>
                                      <div>
                                        <strong>Role:</strong> {entry.role}
                                      </div>
                                      <div>
                                        <strong>Duration:</strong>{" "}
                                        {entry.duration}
                                      </div>
                                      <div>
                                        <strong>Responsibilities:</strong>
                                        <div className="mt-1 pl-4 text-sm">
                                          {entry.responsibilities}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {resume.skills && (
                          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-100">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                              <Code className="h-5 w-5 text-cyan-600" />
                              Technical Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {parseSkills(resume.skills).map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm capitalize"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
