import { z } from "zod";

export const FormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ),
    // FIXED MOBILE VALIDATION for Indian numbers
  mobile: z
  .string()
  .min(1, "Phone number is required")
  .refine((value) => {
    if (!value) return false;
    
    // Remove any non-digit characters
    const cleanedValue = value.replace(/\D/g, '');
    
    // Indian mobile numbers: 10 digits starting with 6,7,8,9
    const indianMobileRegex = /^[6-9]\d{9}$/;
    
    return indianMobileRegex.test(cleanedValue);
  }, "Please enter a valid 10-digit Indian mobile number (should start with 6,7,8,9)"),
   password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["USER", "ADMIN", "RECRUITER", "SUPER_ADMIN"]).default("USER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const emailLocal = data.email.split("@")[0].toLowerCase();
      const passwordLower = data.password.toLowerCase();
      return !passwordLower.includes(emailLocal);
    },
    {
      message: "Password cannot contain your email",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      // Extract only the mobile number part for password check
      const phone = data.mobile.replace(/\D/g, "");
      const mobileOnly = phone.length === 12 && phone.startsWith('91') 
        ? phone.substring(2) 
        : phone.length === 10 ? phone : phone;
      return !data.password.includes(mobileOnly);
    },
    {
      message: "Password cannot contain your phone number",
      path: ["password"],
    }
  );

