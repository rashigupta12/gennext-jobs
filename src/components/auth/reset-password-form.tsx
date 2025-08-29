"use client";

import { resetPassword } from "@/actions/resetPassword";
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
import { ResetPasswordSchema } from "@/validaton-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      resetPassword(values, token)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            setSuccess(data.success);
          }
        })
        .catch(() => {
          setError("Something went wrong!");
        });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-teal-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        {/* Logo Section */}
        <div className="flex justify-center">
          <Link href="/">
            <Image
              alt={Details.name}
              src={Details.logoUrl}
              height={80}
              width={80}
              className="shadow-sm rounded-full p-2 "
            />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter a new password for your account
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">New Password</div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Enter your new password"
                        className="h-12 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-[#04aa6d] focus:border-transparent pr-10"
                        type={showPassword ? "text" : "password"}
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? "👁" : "👁‍🗨"}
                      </button>
                    </div>
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
              className="w-full h-12 bg-gennext text-white rounded-lg font-medium hover:bg-gennext-dark transition-all duration-300 transform hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Remember your password? <span className="text-gennext-dark font-medium">Login Instead</span>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
