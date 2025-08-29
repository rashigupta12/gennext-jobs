"use client";

import { verifyEmail } from "@/actions/verifyEmail";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import { Details } from "@/lib/data";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";

export function EmailVerificationForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    setIsLoading(true);

    if (!token) {
      setError("Missing token!");
      setIsLoading(false);
      return;
    }

    verifyEmail(token)
      .then((data) => {
        setError(data.error);
        setSuccess(data.success);
      })
      .catch((err) => {
        console.error("Error during email verification:", err);
        setError("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <CardWrapper
        headerLabel="Email Verification"
        backButtonLabel="Back to login"
        backButtonHref="/auth/login"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src={Details.logoUrl}
            alt={Details.name}
            width={150}
            height={150}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-4 w-full text-center">
          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <BeatLoader color="#2563eb" />
              <p className="text-gray-600 text-sm">Confirming your verification...</p>
            </div>
          )}

          {!isLoading && (
            <>
              <FormError message={error} />
              <FormSuccess message={success} />
            </>
          )}
        </div>
      </CardWrapper>
    </div>
  );
}
