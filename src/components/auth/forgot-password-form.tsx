
"use client";

import { initiatePasswordReset } from "@/actions/initiatePasswordReset";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Details } from "@/lib/data";
import { ForgotPasswordSchema } from "@/validaton-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      initiatePasswordReset(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }
          if (data?.success) {
            form.reset();
            setSuccess(data?.success);
          }
        })
        .catch(() => {
          setError("Something went wrong!");
        });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-teal-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl flex flex-col space-y-6 border border-gray-200">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <Image
              alt={Details.name}
              src={Details.logoUrl}
              height={150}
              width={150}
              className="shadow-sm rounded-full p-2 "
            />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email below and we’ll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">Email Address</div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-[#04aa6d] focus:border-transparent"
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            {error && <FormError message={error} />}
            {success && <FormSuccess message={success} />}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gennext text-white font-semibold rounded-lg hover:bg-gennext-dark transition-all duration-300 transform hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Remember your password? {" "}
                <span className="text-gennext hover:text-gennext-dark font-medium">
                  Login Instead
                </span>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}