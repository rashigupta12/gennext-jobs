/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Define the schema for recruiter form validation
const RecruiterFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  profile: z.string().optional(),
  role: z.enum(["RECRUITER", "ADMIN"]).default("RECRUITER"),
  companyId: z.string().optional(),
});

type RecruiterFormProps = {
  onCancel?: () => void;
  onRecruiterCreated: (recruiter: any) => void;
  isSubmitting?: boolean;
  companyId?: string;
};

export const RecruiterForm = ({ 
  onCancel, 
  onRecruiterCreated, 
  isSubmitting = false,
  companyId
}: RecruiterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>();

  const form = useForm<z.infer<typeof RecruiterFormSchema>>({
    resolver: zodResolver(RecruiterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "RECRUITER",
      companyId: companyId,
    },
  });

  const createRecruiterViaAPI = async (data: z.infer<typeof RecruiterFormSchema>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          password: data.password, // This will be stored as defaultpassword in the API
          role: data.role,
          companyId: data.companyId,
          profile: data.profile,
          generatePassword: false, // We're providing our own password
          sendWelcomeEmail: true, // Send welcome email with the provided password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create recruiter');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const onSubmit = async (data: z.infer<typeof RecruiterFormSchema>) => {
    setError(undefined);
    setSuccess(undefined);
    
    startTransition(async () => {
      try {
        // Call the users API to create the recruiter
        const result = await createRecruiterViaAPI(data);
        
        if (result.success) {
          // Pass the new recruiter back to the parent component
          onRecruiterCreated(result.data);
          
          console.log("New recruiter created:", result.data);
          
          // Reset the form
          form.reset();
          
          // Set success message
          setSuccess(result.message);
          
          // Show success toast
          toast({
            title: "Recruiter created successfully",
            description: result.message,
          });
        } else {
          setError(result.message || "Failed to create recruiter");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create recruiter. Please try again.";
        setError(errorMessage);
        console.error("Error creating recruiter:", err);
        
        // Show error toast
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
      <CardHeader className="bg-gray-50 px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Create New Recruiter</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details to create a new recruiter account
        </p>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Grid Layout for Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Name Field */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-5 text-gray-500" />
                        <Input 
                          {...field} 
                          className="pl-10 w-full rounded-md" 
                          placeholder="Name" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input 
                          {...field} 
                          className="pl-10 w-full rounded-md" 
                          placeholder="Email" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Field */}
              <FormField
                name="mobile"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input 
                          {...field} 
                          className="pl-10 w-full rounded-md" 
                          placeholder="Mobile Number" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-blue-500" />
                          )}
                        </Button>
                        <Input 
                          {...field} 
                          className="pl-10 pr-12 w-full rounded-md" 
                          placeholder="Default Password" 
                          type={showPassword ? "text" : "password"} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>

      {/* Form Actions */}
      <CardFooter className="flex justify-end space-x-2 pt-4 bg-gray-50 px-6 py-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending ? "Creating..." : "Create Recruiter"}
        </Button>
      </CardFooter>
    </Card>
  );
};