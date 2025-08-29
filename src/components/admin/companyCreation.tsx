"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Building, Briefcase, Edit } from "lucide-react";
import {  useRouter } from "next/navigation";
import { UploadButton } from "@/utils/uploadthing";
import Image from "next/image";

// Simple alert function to match the existing code
const showAlert = (message: string) => {
  alert(message);
};

interface CompanyFormData {
  name: string;
  industry: string;
  description: string;
  website: string;
  logo: string;
}

interface CompanyCreationFormProps {
  onCancel?: () => void;
}

const CompanyCreationForm = ({ onCancel }: CompanyCreationFormProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      website: "",
      logo: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    if (!session?.user?.id) {
      showAlert("You must be logged in to create a company");
      return;
    }

    console.log("Form data:", data);
    console.log("userid", session.user.id);

    setIsSubmitting(true);

    try {
      // No need to handle logo upload separately, as UploadThing already did it
      // and placed the URL in data.logo
      const companyData = {
        ...data,
        createdBy: session.user.id,
        isVerified: false,
      };
      console.log("Company data to be sent:", companyData);

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      showAlert("Company created successfully!");
      router.refresh(); // Refresh the page to show the new company dashboard
    } catch (error) {
      console.error("Error creating company:", error);
      showAlert("Failed to create company. Please try again.");
    } finally {
      setIsSubmitting(false);
      
    }
    router.refresh(); // Refresh the page to show the new company dashboard
    window.location.reload(); // Reload the page to show the new company dashboard
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Building className="mr-2 h-6 w-6" />
          Create Your Company
        </h1>
        <p className="text-muted-foreground mt-2">
          Set up your company profile to start posting job listings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Please provide details about your company. This information will be
            visible to job seekers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter company name"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Technology, Healthcare, Finance"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell potential candidates about your company..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include your company mission, values, and culture.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.yourcompany.com"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo Upload with UploadThing */}
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo*</FormLabel>
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50 relative">
                        {logoPreview || field.value ? (
                          <>
                            <Image
                              src={logoPreview || field.value}
                              alt="Logo preview"
                              className="w-full h-full object-contain"
                              width={96}
                              height={96}
                              id="logo-preview"
                            />
                            <div
                              className="p-6 h-24 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() =>
                                document.getElementById("logo-upload")?.click()
                              }
                            >
                              <Edit className="h-6 w-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <Building className="h-12 w-12 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                if (res && res[0]) {
                                  field.onChange(res[0].serverData.fileUrl);
                                  setLogoPreview(res[0].serverData.fileUrl);
                                }
                              }}
                              onUploadError={(error: Error) => {
                                console.error("Upload error:", error);
                                alert(`Upload failed: ${error.message}`);
                              }}
                              appearance={{
                                button: `bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 transition-colors ${
                                  logoPreview || field.value
                                    ? "opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                    : ""
                                }`,
                              }}
                              content={{
                                button({ ready }: { ready: boolean }) {
                                  if (ready) {
                                    return (
                                      <div className="flex ml-8 items-center p-6 py-12">
                                        <Building className="mr-2 h-6 w-6" />{" "}
                                        <p className=" w-32">Upload Logo</p>
                                      </div>
                                    );
                                  }
                                  return "Loading...";
                                },
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="mt-2">
                          Upload a square logo image (recommended size:
                          200x200px, max 4MB)
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Briefcase className="mr-2 h-4 w-4" /> Create Company
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Fields marked with * are required
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompanyCreationForm;
