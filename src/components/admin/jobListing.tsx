/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Award, Briefcase, FileText, Plus, Settings, Trash2, Upload, Loader2 } from "lucide-react";
import { z } from "zod";
// Import UI components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
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
import {
  Select, SelectContent,
  SelectItem, SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useSession } from "next-auth/react";
import { useWatch } from "react-hook-form";
import SalaryInputField from "../common/SalaryInputField";
import {
  fetchCategories,
  fetchCompanies,
  fetchSubcategories,
} from "./JobListingApi";
import SalaryInputFieldNew from "./Salaryinput";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

// Validation schema (based on the provided schema)
const jobListingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(255, "Slug cannot exceed 255 characters")
    .optional(),
  categoryId: z.string().uuid("Please select a valid category"),
  subcategoryId: z
    .string()
    .uuid("Please select a valid subcategory")
    .optional(),
  companyId: z.string().uuid("Please select a valid company"),
  duration: z
    .string()
    .max(50, "Duration cannot exceed 50 characters")
    .optional(),
  salary: z
    .string()
    .max(100, "Salary information cannot exceed 100 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters")
    .optional(),
  startDate: z
    .string()
    .max(100, "Start date information cannot exceed 100 characters")
    .optional(),
  openings: z
    .number()
    .int()
    .positive("Number of openings must be positive")
    .default(1),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  role: z.string().max(100, "Role cannot exceed 100 characters").optional(),
  department: z
    .string()
    .max(100, "Department cannot exceed 100 characters")
    .optional(),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"])
    .default("FULL_TIME"),
  education: z
    .string()
    .max(200, "Education requirements cannot exceed 200 characters")
    .optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
  userId: z.string().uuid("User ID is required"),
});

const JobListingForm: React.FC = () => {
  // Mock data for dropdowns - in a real app these would come from API calls
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [jdText, setJdText] = useState("");
const [isParsingJD, setIsParsingJD] = useState(false);
const [showJDUpload, setShowJDUpload] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showConfirmParsingDialog, setShowConfirmParsingDialog] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {toast} = useToast();
  
  // Get the session object
  const session = useSession();
  const userId = session?.data?.user?.id;
  const [isLoading, setIsLoading] = useState(false);
  
  // Form setup
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      slug: "",
      categoryId: "",
      subcategoryId: "",
      companyId: "",
      duration: "",
      salary: "",
      location: "",
      startDate: "",
      openings: 1,
      description: "",
      highlights: [],
      qualifications: [],
      skills: [],
      role: "",
      department: "",
      employmentType: "FULL_TIME" as const,
      education: "",
      isFeatured: false,
      isActive: true,
      expiresAt: "",
      userId: userId || "",
    },
  });

  // For array fields (highlights, qualifications, skills) - Use controlled state
  const [arrayInputs, setArrayInputs] = useState({
    highlights: "",
    qualifications: "",
    skills: ""
  });

  // Watch categoryId for subcategory loading
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  
  useEffect(() => {
    if (subcategories.length > 0) {
      setIsLoading(false);
    }
  }, [subcategories]);

  // Fetch companies and categories on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [fetchedCategories, fetchedCompanies] = await Promise.all([
          fetchCategories(),
          fetchCompanies(userId as string),
        ]);
        setCategories(fetchedCategories || []);
        setCompanies(fetchedCompanies || []);
        if (fetchedCompanies && fetchedCompanies.length > 0) {
          form.setValue("companyId", fetchedCompanies[0]?.id);
        }
      } catch (error) {
        setError("Failed to load initial data.");
        toast({
          title: "Error",
          description: "Failed to load initial data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.data?.user?.id) {
      loadInitialData();
    }
  }, [session?.data?.user?.id, form, userId]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      form.setValue("subcategoryId", "");
      return;
    }

    const loadSubcategories = async (categoryId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedSubcategories = await fetchSubcategories(categoryId);
        setSubcategories(fetchedSubcategories || []);
      } catch (error) {
        setError("Failed to load subcategories.");
        toast({
          title: "Error",
          description: "Failed to load subcategories.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSubcategories(categoryId);
  }, [categoryId, form]);

  // Function to add item to array field - Fixed to prevent input clearing issues
  const addItemToArray = (
    fieldName: "highlights" | "qualifications" | "skills",
    value: string
  ) => {
    if (!value.trim()) return;

    const currentArray = form.getValues(fieldName) || [];
    form.setValue(fieldName, [...currentArray, value.trim()]);
    
    // Clear the input using controlled state
    setArrayInputs(prev => ({
      ...prev,
      [fieldName]: ""
    }));
  };

  // Function to remove item from array field
  const removeItemFromArray = (
    fieldName: "highlights" | "qualifications" | "skills",
    index: number
  ) => {
    const currentArray = form.getValues(fieldName) || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    form.setValue(fieldName, newArray);
  };

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title.toLowerCase().replace(/\s+/g, "-");
      form.setValue("slug", slug);
    }
  };

  // Handle Enter key press to prevent form submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['txt', 'doc', 'docx', 'pdf'];
  
  if (!fileExtension || !validExtensions.includes(fileExtension)) {
    toast({
      title: "Error",
      description: "Please upload a .txt, .doc, .docx, or .pdf file",
      variant: "destructive",
    });
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "Error",
      description: "File size must be less than 5MB",
      variant: "destructive",
    });
    return;
  }

  try {
    setIsParsingJD(true);
    let text = '';

    if (fileExtension === 'txt') {
      // Handle .txt files
      text = await file.text();
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      // Handle Word files using mammoth
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else if (fileExtension === 'pdf') {
      // Handle PDF files using pdf.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Extract text from all pages
      const textPromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(
          pdf.getPage(i).then(page => 
            page.getTextContent().then(content => 
              content.items.map((item: any) => item.str).join(' ')
            )
          )
        );
      }
      
      const pages = await Promise.all(textPromises);
      text = pages.join('\n\n');
    }

    console.log('File loaded, length:', text.length);
    
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "The file appears to be empty or couldn't be read",
        variant: "destructive",
      });
      setIsParsingJD(false);
      return;
    }

    // Auto-parse the JD after file upload
    await handleParseJD(text);
    
  } catch (error) {
    console.error('Error reading file:', error);
    toast({
      title: "Error",
      description: "Failed to read file. Please try a different format.",
      variant: "destructive",
    });
    setIsParsingJD(false);
  }
};

// Replace the handleParseJD function with this new version
const handleParseJD = async (text?: string) => {
  const jdTextToParse = text || jdText;
  
  if (!jdTextToParse.trim()) {
    toast({
      title: "Error",
      description: "Please enter or upload a job description",
      variant: "destructive",
    });
    return;
  }

  console.log("Starting to parse JD...");
  console.log("JD Text length:", jdTextToParse.length);
  
  setIsParsingJD(true);
  try {
    const response = await fetch("/api/parse-jd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jdText: jdTextToParse }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(errorData.error || "Failed to parse job description");
    }

    const result = await response.json();
    console.log("Full API result:", result);
    console.log("Parsed data:", result.data);
    
    const parsedData = result.data;

    // Store parsed data and show confirmation dialog
    setParsedData(parsedData);
    
  } catch (error) {
    console.error("Error parsing JD:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to parse job description. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsParsingJD(false);
  }
};




//  const handleParseJD = async () => {
//   if (!jdText.trim()) {
//     toast({
//       title: "Error",
//       description: "Please enter or upload a job description",
//       variant: "destructive",
//     });
//     return;
//   }

//   console.log("Starting to parse JD..."); // DEBUG
//   console.log("JD Text length:", jdText.length); // DEBUG
  
//   setIsParsingJD(true);
//   try {
//     const response = await fetch("/api/parse-jd", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ jdText }),
//     });

//     console.log("Response status:", response.status); // DEBUG

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("API Error:", errorData); // DEBUG
//       throw new Error(errorData.error || "Failed to parse job description");
//     }

//     const result = await response.json();
//     console.log("Full API result:", result); // DEBUG
//     console.log("Parsed data:", result.data); // DEBUG
    
//     const parsedData = result.data;

//     // Populate form fields with detailed logging
//     if (parsedData.title) {
//       console.log("Setting title:", parsedData.title); // DEBUG
//       form.setValue("title", parsedData.title);
//     }
//     if (parsedData.location) {
//       console.log("Setting location:", parsedData.location); // DEBUG
//       form.setValue("location", parsedData.location);
//     }
//     if (parsedData.salary) {
//       console.log("Setting salary:", parsedData.salary); // DEBUG
//       form.setValue("salary", parsedData.salary);
//     }
//     if (parsedData.employmentType) {
//       console.log("Setting employmentType:", parsedData.employmentType); // DEBUG
//       form.setValue("employmentType", parsedData.employmentType);
//     }
//     if (parsedData.department) form.setValue("department", parsedData.department);
//     if (parsedData.description) form.setValue("description", parsedData.description);
//     if (parsedData.education) form.setValue("education", parsedData.education);
//     if (parsedData.startDate) form.setValue("startDate", parsedData.startDate);
//     if (parsedData.openings) form.setValue("openings", parsedData.openings);
    
//     // Handle array fields
//     if (parsedData.highlights?.length > 0) {
//       console.log("Setting highlights:", parsedData.highlights); // DEBUG
//       form.setValue("highlights", parsedData.highlights);
//     }
//     if (parsedData.qualifications?.length > 0) {
//       console.log("Setting qualifications:", parsedData.qualifications); // DEBUG
//       form.setValue("qualifications", parsedData.qualifications);
//     }
//     if (parsedData.skills?.length > 0) {
//       console.log("Setting skills:", parsedData.skills); // DEBUG
//       form.setValue("skills", parsedData.skills);
//     }

//     // Generate slug
//     if (parsedData.title) {
//       const slug = parsedData.title.toLowerCase().replace(/\s+/g, "-");
//       form.setValue("slug", slug);
//     }

//     console.log("All values set successfully!"); // DEBUG

//     setShowJDUpload(false);
//     setJdText("");
    
//     toast({
//       title: "Success",
//       description: "Job description parsed successfully!",
//     });
//   } catch (error) {
//     console.error("Error parsing JD:", error); // DEBUG
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to parse job description. Please try again.",
//       variant: "destructive",
//     });
//   } finally {
//     setIsParsingJD(false);
//   }
// };


  // Handle form submission with confirmation
  const handleSubmit = (data: z.infer<typeof jobListingSchema>) => {
    setPendingFormData(data);
    setShowConfirmDialog(true);
  };

  // Actual form submission after confirmation
  const onConfirmedSubmit = async () => {
    if (!pendingFormData) return;
    
    try {
      const response = await fetch("/api/job-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pendingFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create job listing",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Job listing created successfully!",
      });
      form.reset();
      // Reset array inputs as well
      setArrayInputs({
        highlights: "",
        qualifications: "",
        skills: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setShowConfirmDialog(false);
      setPendingFormData(null);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const newCategoryResponse = await response.json();
        const newCategory = newCategoryResponse.category; 
      setCategories(prev => [...prev, newCategory]);
      
      // Set the newly created category as selected
      form.setValue("categoryId", newCategory.id);
      
      setNewCategoryName("");
      setShowCategoryDialog(false);
      
      toast({
        title: "Success",
        description: "Category created successfully!",
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmParsedData = () => {
  if (!parsedData) return;

  console.log("Applying parsed data to form...");

  // Populate form fields with parsed data
  if (parsedData.title) {
    console.log("Setting title:", parsedData.title);
    form.setValue("title", parsedData.title);
  }
  if (parsedData.location) {
    console.log("Setting location:", parsedData.location);
    form.setValue("location", parsedData.location);
  }
  if (parsedData.salary) {
    console.log("Setting salary:", parsedData.salary);
    form.setValue("salary", parsedData.salary);
  }
  if (parsedData.employmentType) {
    console.log("Setting employmentType:", parsedData.employmentType);
    form.setValue("employmentType", parsedData.employmentType);
  }
  if (parsedData.department) form.setValue("department", parsedData.department);
  if (parsedData.description) form.setValue("description", parsedData.description);
  if (parsedData.education) form.setValue("education", parsedData.education);
  if (parsedData.startDate) form.setValue("startDate", parsedData.startDate);
  if (parsedData.openings) form.setValue("openings", parsedData.openings);
  
  // Handle array fields
  if (parsedData.highlights?.length > 0) {
    console.log("Setting highlights:", parsedData.highlights);
    form.setValue("highlights", parsedData.highlights);
  }
  if (parsedData.qualifications?.length > 0) {
    console.log("Setting qualifications:", parsedData.qualifications);
    form.setValue("qualifications", parsedData.qualifications);
  }
  if (parsedData.skills?.length > 0) {
    console.log("Setting skills:", parsedData.skills);
    form.setValue("skills", parsedData.skills);
  }

  // Generate slug
  if (parsedData.title) {
    const slug = parsedData.title.toLowerCase().replace(/\s+/g, "-");
    form.setValue("slug", slug);
  }

  console.log("All values set successfully!");

  
  setJdText("");
  setParsedData(null);
  
  toast({
    title: "Success",
    description: "Job description parsed and fields auto-filled!",
  });
};

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim() || !form.watch("categoryId")) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/subCategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSubcategoryName.trim(),
          categoryId: form.watch("categoryId")
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subcategory');
      }

      const newSubcategory = await response.json();
      setSubcategories(prev => [...prev, newSubcategory]);
      
      // Set the newly created subcategory as selected
      form.setValue("subcategoryId", newSubcategory.id);
      
      setNewSubcategoryName("");
      setShowSubcategoryDialog(false);
      
      toast({
        title: "Success",
        description: "Subcategory created successfully!",
      });
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to create subcategory",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed Array field component with controlled inputs
  const ArrayFieldSection = ({ 
    title, 
    fieldName, 
    placeholder
  }: {
    title: string;
    fieldName: "highlights" | "qualifications" | "skills";
    placeholder: string;
  }) => (
    <div className="space-y-3">
      <FormLabel className="text-sm font-medium">{title}</FormLabel>
      <div className="flex gap-2">
        <Input
          value={arrayInputs[fieldName]}
          onChange={(e) => setArrayInputs(prev => ({
            ...prev,
            [fieldName]: e.target.value
          }))}
          placeholder={placeholder}
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItemToArray(fieldName, arrayInputs[fieldName]);
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={() => addItemToArray(fieldName, arrayInputs[fieldName])}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {form.watch(fieldName)?.map((item, index) => (
          <div
            key={`${fieldName}-${index}-${item}`}
            className="flex items-center bg-slate-50 p-2 rounded text-sm"
          >
            <span className="flex-1">{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItemFromArray(fieldName, index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full max-w-full mx-auto ">
        <Card className="w-full">
<CardHeader className="pb-2">
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold">Create Job Listing</h2>
    <div className="flex gap-2">
      {/* Hidden file input that gets triggered by the button */}
      <input
        id="jd-file-upload"
        type="file"
        accept=".txt,.doc,.docx,.pdf"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isParsingJD}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => document.getElementById('jd-file-upload')?.click()}
        disabled={isParsingJD}
      >
        {isParsingJD ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {isParsingJD ? "Parsing..." : "Upload JD"}
      </Button>
      
      {/* <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowJDUpload(!showJDUpload)}
      >
        <FileText className="h-4 w-4 mr-2" />
        Paste Text
      </Button> */}
    </div>
  </div>
  
  {/* Only show the textarea for manual pasting */}
  {showJDUpload && (
    <div className="mt-4 p-4 border rounded-lg bg-slate-50 space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">Paste Job Description</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setShowJDUpload(false);
            setJdText("");
          }}
        >
          Close
        </Button>
      </div>
      
      <Textarea
        placeholder="Paste the complete job description here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        className="min-h-[150px] text-sm"
      />
      <Button
        type="button"
        size="sm"
        onClick={() => handleParseJD()}
        disabled={isParsingJD || !jdText.trim()}
        className="w-full"
      >
        {isParsingJD ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Parsing...
          </>
        ) : (
          <>
            <FileText className="h-3 w-3 mr-1" />
            Parse Pasted Text
          </>
        )}
      </Button>
    </div>
  )}

  {/* Show parsed data in editable form */}
  {parsedData && (
    <div className="mt-4 p-4 border rounded-lg bg-blue-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-blue-800">Edit Parsed Job Details</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmParsedData}
            className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
          >
            Confirm
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setParsedData(null);
              setJdText("");
            }}
            className="text-xs h-7"
          >
            Discard
          </Button>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        {/* Single line text fields */}
        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Job Title</label>
          <input
            type="text"
            value={parsedData.title || ''}
            onChange={(e) => setParsedData({...parsedData, title: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="Enter job title"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Location</label>
          <input
            type="text"
            value={parsedData.location || ''}
            onChange={(e) => setParsedData({...parsedData, location: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="Enter location"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Salary</label>
          <input
            type="text"
            value={parsedData.salary || ''}
            onChange={(e) => setParsedData({...parsedData, salary: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="Enter salary range"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Employment Type</label>
          <input
            type="text"
            value={parsedData.employmentType || ''}
            onChange={(e) => setParsedData({...parsedData, employmentType: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="e.g., Full-time, Part-time, Contract"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Department</label>
          <input
            type="text"
            value={parsedData.department || ''}
            onChange={(e) => setParsedData({...parsedData, department: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="Enter department"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Number of Openings</label>
          <input
            type="number"
            value={parsedData.openings || ''}
            onChange={(e) => setParsedData({...parsedData, openings: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="Enter number of openings"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Education Requirements</label>
          <input
            type="text"
            value={parsedData.education || ''}
            onChange={(e) => setParsedData({...parsedData, education: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="Enter education requirements"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Start Date</label>
          <input
            type="text"
            value={parsedData.startDate || ''}
            onChange={(e) => setParsedData({...parsedData, startDate: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white"
            placeholder="Enter start date"
          />
        </div>

        {/* Array fields - editable textareas with comma separation */}
        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Highlights (comma separated)</label>
          <textarea
            value={parsedData.highlights?.join(', ') || ''}
            onChange={(e) => setParsedData({
              ...parsedData, 
              highlights: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            })}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white min-h-[60px]"
            placeholder="Enter highlights separated by commas"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Qualifications (comma separated)</label>
          <textarea
            value={parsedData.qualifications?.join(', ') || ''}
            onChange={(e) => setParsedData({
              ...parsedData, 
              qualifications: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            })}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white min-h-[60px]"
            placeholder="Enter qualifications separated by commas"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Skills (comma separated)</label>
          <textarea
            value={parsedData.skills?.join(', ') || ''}
            onChange={(e) => setParsedData({
              ...parsedData, 
              skills: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            })}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white min-h-[60px]"
            placeholder="Enter skills separated by commas"
          />
        </div>

        {/* Description field - full editable textarea */}
        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Job Description</label>
          <textarea
            value={parsedData.description || ''}
            onChange={(e) => setParsedData({...parsedData, description: e.target.value})}
            className="w-full p-2 border border-blue-200 rounded text-sm bg-white min-h-[80px]"
            placeholder="Enter job description"
          />
        </div>
      </div>
    </div>
  )}
</CardHeader>

          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(handleSubmit)} 
                className="space-y-4"
                onKeyDown={handleKeyPress}
              >
                {/* Desktop View */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* Basic Information */}
                    <div className="xl:col-span-3 lg:col-span-2">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Basic Information
                      </h3>
                      <Separator className="my-3" />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Senior Frontend Developer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="e.g. senior-frontend-developer"
                                {...field}
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generateSlug}
                            >
                              Generate
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company*</FormLabel>
                          <FormControl>
                            <Input
                              value={companies.length > 0 ? companies[0].name : "Loading..."}
                              disabled={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <div className="flex gap-2">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={`category-${category.id}`} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCategoryDialog(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subcategoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!form.watch("categoryId") || isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="flex-1">
                                  <SelectValue
                                    placeholder={
                                      form.watch("categoryId")
                                        ? isLoading
                                          ? "Loading..."
                                          : subcategories.length > 0
                                          ? "Select a subcategory"
                                          : "No subcategories available"
                                        : "Select a category first"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subcategories.length > 0 ? (
                                  subcategories.map((subcategory) => (
                                    <SelectItem key={`subcategory-${subcategory.id}`} value={subcategory.id}>
                                      {subcategory.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem key="none-subcategory" value="none" disabled>
                                    {form.watch("categoryId")
                                      ? "No subcategories available"
                                      : "Select a category first"}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSubcategoryDialog(true)}
                              disabled={!form.watch("categoryId")}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type*</FormLabel>
                          <FormControl>
                            <select
                              className="w-full p-2 border rounded"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="FULL_TIME">Full Time</option>
                              <option value="PART_TIME">Part Time</option>
                              <option value="CONTRACT">Contract</option>
                              <option value="INTERNSHIP">Internship</option>
                              <option value="FREELANCE">Freelance</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Openings</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value, 10) || 1)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. New York, Remote" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <SalaryInputFieldNew form={form} name="salary"/>

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Immediate, Feb 2025" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Engineering, Marketing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem className="xl:col-span-2">
                          <FormLabel>Education Requirements</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Bachelor's in Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={
                                field.value
                                  ? new Date(field.value).toISOString().slice(0, 16)
                                  : ""
                              }
                              onChange={(e) => {
                                if (e.target.value) {
                                  const localDate = new Date(e.target.value);
                                  const isoString = localDate.toISOString();
                                  field.onChange(isoString);
                                } else {
                                  field.onChange("");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="xl:col-span-3 lg:col-span-2">
                          <FormLabel>Full Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed description of the job role and responsibilities"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Array fields in desktop */}
                    <div className="xl:col-span-3 lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <ArrayFieldSection
                        title="Highlights"
                        fieldName="highlights"
                        placeholder="Add a key highlight"
                      />
                      <ArrayFieldSection
                        title="Qualifications"
                        fieldName="qualifications"
                        placeholder="Add a qualification"
                      />
                      <ArrayFieldSection
                        title="Skills"
                        fieldName="skills"
                        placeholder="Add a required skill"
                      />
                    </div>

                    {/* Settings */}
                    <div className="xl:col-span-3 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Active Listing</FormLabel>
                              <FormDescription className="text-xs">
                                Job will be visible to candidates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Featured Listing</FormLabel>
                              <FormDescription className="text-xs">
                                Job will be highlighted in search results
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Accordion View */}
                <div className="md:hidden">
                  <Accordion type="single" collapsible className="w-full " defaultValue="basic">
                    <AccordionItem value="basic">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Basic Information
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 ">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    placeholder="e.g. senior-frontend-developer"
                                    {...field}
                                    className="flex-1"
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={generateSlug}
                                >
                                  Generate
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company*</FormLabel>
                              <FormControl>
                                <Input
                                  value={companies.length > 0 ? companies[0].name : "Loading..."}
                                  disabled={true}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category*</FormLabel>
                              <div className="flex gap-2">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={`mobile-category-${category.id}`} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowCategoryDialog(true)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subcategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategory</FormLabel>
                              <div className="flex gap-2">
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={!form.watch("categoryId") || isLoading}
                                >
                                  <FormControl>
                                    <SelectTrigger className="flex-1">
                                      <SelectValue
                                        placeholder={
                                          form.watch("categoryId")
                                            ? isLoading
                                              ? "Loading..."
                                              : subcategories.length > 0
                                              ? "Select a subcategory"
                                              : "No subcategories available"
                                            : "Select a category first"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subcategories.length > 0 ? (
                                      subcategories.map((subcategory) => (
                                        <SelectItem key={`mobile-subcategory-${subcategory.id}`} value={subcategory.id}>
                                          {subcategory.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem key="mobile-none-subcategory" value="none" disabled>
                                        {form.watch("categoryId")
                                          ? "No subcategories available"
                                          : "Select a category first"}
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowSubcategoryDialog(true)}
                                  disabled={!form.watch("categoryId")}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="job-details">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Job Details
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="employmentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employment Type*</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full p-2 border rounded"
                                  value={field.value}
                                  onChange={field.onChange}
                                >
                                  <option value="FULL_TIME">Full Time</option>
                                  <option value="PART_TIME">Part Time</option>
                                  <option value="CONTRACT">Contract</option>
                                  <option value="INTERNSHIP">Internship</option>
                                  <option value="FREELANCE">Freelance</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="openings"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Openings</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value, 10) || 1)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. New York, Remote" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <SalaryInputFieldNew form={form} name="salary"/>

                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Immediate, Feb 2025" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Engineering, Marketing" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="education"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Education Requirements</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Bachelor's in Computer Science" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="expiresAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date & Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  value={
                                    field.value
                                      ? new Date(field.value).toISOString().slice(0, 16)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const localDate = new Date(e.target.value);
                                      const isoString = localDate.toISOString();
                                      field.onChange(isoString);
                                    } else {
                                      field.onChange("");
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="description">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Job Description
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Detailed description of the job role and responsibilities"
                                  className="min-h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="requirements">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Requirements & Skills
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <ArrayFieldSection
                          title="Highlights"
                          fieldName="highlights"
                          placeholder="Add a key highlight"
                        />
                        <ArrayFieldSection
                          title="Qualifications"
                          fieldName="qualifications"
                          placeholder="Add a qualification"
                        />
                        <ArrayFieldSection
                          title="Skills"
                          fieldName="skills"
                          placeholder="Add a required skill"
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="settings">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Listing Settings
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Active Listing</FormLabel>
                                <FormDescription className="text-xs">
                                  Job will be visible to candidates
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Featured Listing</FormLabel>
                                <FormDescription className="text-xs">
                                  Job will be highlighted in search results
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Submit Button */}
               <div className="pt-6 flex justify-end">
  <Button type="submit" className="min-w-[200px]">
    <FileText className="h-4 w-4 mr-2" />
    Create Job Listing
  </Button>
</div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Job Listing Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this job listing? Please review all the details before confirming.
              <div className="mt-4 p-3 bg-slate-50 rounded text-sm">
                <strong>Job Title:</strong> {pendingFormData?.title}<br/>
                <strong>Company:</strong> {companies.find(c => c.id === pendingFormData?.companyId)?.name}<br/>
                <strong>Location:</strong> {pendingFormData?.location || 'Not specified'}<br/>
                <strong>Employment Type:</strong> {pendingFormData?.employmentType}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false);
              setPendingFormData(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmedSubmit}>
              Create Job Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Dialog */}
      <AlertDialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Category</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new job category that will be available for all job listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateCategory();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowCategoryDialog(false);
                setNewCategoryName("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subcategory Dialog */}
      <AlertDialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Subcategory</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new subcategory for &quot;{categories.find(c => c.id === form.watch("categoryId"))?.name || 'selected category'}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter subcategory name"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateSubcategory();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowSubcategoryDialog(false);
                setNewSubcategoryName("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCreateSubcategory}
              disabled={!newSubcategoryName.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Subcategory"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default JobListingForm;