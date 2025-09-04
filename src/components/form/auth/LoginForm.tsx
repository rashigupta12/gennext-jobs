/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { loginUser } from "@/actions/loginUser";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Details } from "@/lib/data";
import { LoginSchema } from "@/validaton-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Eye, EyeOff, Lock, Mail, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { toast } from "sonner";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const watchedEmail = form.watch("email");

  // Email validation check
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function onSubmit(data: z.infer<typeof LoginSchema>) {
    // Check if fields are empty
    if (!data.email || !data.password) {
      toast.error("Please fill in both email and password fields");
      return;
    }

    // Check if email is valid
    if (!isValidEmail(data.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (isPending) return;
    setError(undefined);
    setSuccess(undefined);

    try {
      startTransition(async () => {
        const result = await loginUser(data);
        if (result?.error) {
          setError(result.error);
          toast.error(result.error);
          return;
        }
        if (result?.success) {
          console.log(result)
          setSuccess(result.success);
          if(result.success === "Email sent for email verification!"){
            toast.success("Email Sent Succesfully");
          }
          
          if (result.redirectTo) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            window.location.href = result.redirectTo;
          }
        }
      });
    } catch (e) {
      const errorMessage = "Authentication failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gennext-light via-white to-teal-50 px-4 py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          {/* Left Section: Login Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Link href="/">
              <div className="relative">
                <Image 
                  src={Details.logoUrl} 
                  alt={Details.name}
                  height={150} 
                  width={150} 
                  
                />
                
              </div>
              </Link>
              <div className="text-center space-y-2">
               
                <p className="text-gray-600 font-medium">Login to find your perfect job match</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gennext transition-colors" />
                          <Input
                            {...field}
                            placeholder="Enter your email address"
                            className="h-12 pl-10 pr-10 rounded-xl border-2 border-gray-200  transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm"
                            type="email"
                            disabled={isPending}
                          />
                          {/* Email validation indicator */}
                          {watchedEmail && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isValidEmail(watchedEmail) ? (
                                <CheckCircle className="h-4 w-4 text-gennext" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gennext transition-colors" />
                          <Input
                            {...field}
                            placeholder="Enter your password"
                            className="h-12 pl-10 pr-10 rounded-xl border-2 border-gray-200  transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm"
                            type={showPassword ? "text" : "password"}
                            disabled={isPending}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gennext focus:outline-none transition-colors"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        rememberMe 
                          ? 'bg-gennext border-gennext' 
                          : 'border-gray-300 group-hover:border-gennext'
                      }`}>
                        {rememberMe && (
                          <CheckCircle className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-gray-600 font-medium group-hover:text-gennext transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-gennext hover:text-gennext-dark font-semibold hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <FormError message={error} />
                <FormSuccess message={success} />

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 bg-gradient-to-r from-gennext to-gennext-dark text-white rounded-xl font-semibold hover:from-gennext-soft hover:to-gennext transition-all duration-300 transform hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Login Now"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600 pt-4">
                  Don&apos;t have an account?{" "}
                  <Link 
                    href="/auth/register" 
                    className="text-gennext font-semibold hover:text-gennext-dark hover:underline transition-colors"
                  >
                    Register Here
                  </Link>
                </div>
              </form>
            </Form>
          </div>

          {/* Right Section: Enhanced Visual */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-green-100 to-gennext-dark p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24"></div>
            <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-white/5 rounded-full -translate-x-10 -translate-y-10"></div>
            
            <div className="relative z-10 text-center text-white space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Find Your Dream Job</h2>
                <p className="text-white/90 text-sm leading-relaxed max-w-sm mx-auto">
                  Access thousands of job opportunities and connect with top employers in your field.
                </p>
                <div className="flex justify-center space-x-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">10K+</div>
                    <div className="text-white/80 text-xs">Active Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-white/80 text-xs">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-white/80 text-xs">Job Seekers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;