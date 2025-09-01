/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { registerUser } from "@/actions/registerUser";
import MainButton from "@/components/common/MainButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Details, registerpageImage } from "@/lib/data";
import { FormSchema } from "@/lib/formschema";
import { getPasswordStrength } from "@/lib/HeplerFinal";
import { RegisterFormProps } from "@/lib/types";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import * as z from "zod";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod"; // Add this import

const RegisterForm = ({ text, role }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema), // Add this line to enable Zod validation
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      role: "USER",
    },
  });

  const watchedPassword = form.watch("password");
  const passwordChecks = getPasswordStrength(watchedPassword || "");

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (role) {
      data.role = role;
    }

    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...submitData } = data;

      registerUser(submitData)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
            toast.error(data.error);
          }
          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            toast.success("Registration Successful");
            router.push("/auth/login");
          }
        })
        .catch((error) => {
          const errorMessage = error.message || "Registration failed. Please try again.";
          setError(errorMessage);
          toast.error(errorMessage);
        });
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gennext-light via-white to-teal-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 border border-white/20">
        {/* Left Section: Registration Form */}
        <div className="p-6 lg:p-8 flex flex-col justify-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Link href="/">
              <div className="relative">
                <Image
                  alt={Details.name}
                  src={Details.logoUrl}
                  height={150}
                  width={150}
                  className=""
                />
              </div>
            </Link>
            <div className="text-center space-y-1">
              <p className="text-gray-600 text-sm font-medium">{text}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gennext transition-colors" />
                        <Input
                          {...field}
                          className="h-11 pl-10 pr-4 rounded-xl border-2 border-gray-200   transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="Full Name"
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

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
                          type="email"
                          className="h-11 pl-10 pr-4 rounded-xl border-2 border-gray-200  transition-all  bg-gray-50/50 hover:bg-white"
                          placeholder="Email Address"
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gennext transition-colors" />
                        <Input
                          {...field}
                          type="tel"
                          className="h-11 pl-10 pr-4 rounded-xl border-2 border-gray-200 transition-all bg-gray-50/50 hover:bg-white"
                          placeholder="Mobile (10 digits)"
                          maxLength={10}
                          disabled={isPending}
                          onInput={(e) => {
                            // Remove any non-digit characters and limit to 10 digits
                            const target = e.target as HTMLInputElement;
                            const value = target.value.replace(/\D/g, '').slice(0, 10);
                            target.value = value;
                            field.onChange(value);
                          }}
                          onKeyPress={(e) => {
                            // Only allow digits
                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
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
                      <div className="space-y-2">
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gennext transition-colors" />
                          <Input
                            {...field}
                            className="h-11 pl-10 pr-10 rounded-xl border-2 border-gray-200 focus:ring-0 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            disabled={isPending}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gennext focus:outline-none transition-colors"
                            disabled={isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Password Strength Indicators */}
                        {watchedPassword && (
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div
                              className={`flex items-center space-x-1 ${
                                passwordChecks.length
                                  ? "text-gennext-light"
                                  : "text-gray-400"
                              }`}
                            >
                              {passwordChecks.length ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span>8+ chars</span>
                            </div>
                            <div
                              className={`flex items-center space-x-1 ${
                                passwordChecks.uppercase
                                  ? "text-gennext-light"
                                  : "text-gray-400"
                              }`}
                            >
                              {passwordChecks.uppercase ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span>Upper</span>
                            </div>
                            <div
                              className={`flex items-center space-x-1 ${
                                passwordChecks.lowercase
                                  ? "text-gennext-light"
                                  : "text-gray-400"
                              }`}
                            >
                              {passwordChecks.lowercase ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span>Lower</span>
                            </div>
                            <div
                              className={`flex items-center space-x-1 ${
                                passwordChecks.number
                                  ? "text-gennext-light"
                                  : "text-gray-400"
                              }`}
                            >
                              {passwordChecks.number ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span>Number</span>
                            </div>
                            <div
                              className={`flex items-center space-x-1 col-span-2 ${
                                passwordChecks.special
                                  ? "text-gennext-light"
                                  : "text-gray-400"
                              }`}
                            >
                              {passwordChecks.special ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span>Special (@$!%*?&)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gennext transition-colors" />
                        <Input
                          {...field}
                          className="h-11 pl-10 pr-10 rounded-xl border-2 border-gray-200 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="Confirm Password"
                          type={showConfirmPassword ? "text" : "password"}
                          disabled={isPending}
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gennext focus:outline-none transition-colors"
                          disabled={isPending}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormError message={error} />
              <FormSuccess message={success} />

              <MainButton
                text="Create Account"
                classes="h-12 rounded-xl shadow-xl bg-gradient-to-r from-gennext to-gennext-dark text-white hover:from-gennext hover:to-gennext-dark transition-all duration-300 transform hover:scale-[1.02] font-semibold"
                width="full_width"
                isSubmitable
                isLoading={isPending}
              />

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-gennext-light transition-colors group"
                >
                  Already have an account?
                  <span className="text-gennext hover:text-gennext-dark font-semibold ml-1 group-hover:underline">
                    Sign In
                  </span>
                </Link>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Section: Enhanced Visual */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-gennext-soft  to-gennext-dark p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24"></div>
          <div className="relative z-10 text-center text-white space-y-4">
            <div className="w-48 h-48 mx-auto relative">
              <Image
                src={registerpageImage.imageurl}
                alt="Register"
                className="rounded-2xl shadow-2xl object-cover w-full h-full"
                width={192}
                height={192}
              />
              <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-xl"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Join Our Community</h3>
              <p className="text-white/90 text-sm leading-relaxed max-w-sm mx-auto">
                Create your account and start your journey with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;