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
        
        // Remove all non-digit characters for validation
        const cleanNumber = value.replace(/\D/g, '');
        
        // Check if it's exactly 10 digits (local format)
        if (cleanNumber.length === 10) {
          return /^[6-9][0-9]{9}$/.test(cleanNumber);
        }
        
        // Check if it's 12 digits with country code 91
        if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
          const indianNumber = cleanNumber.substring(2);
          return /^[6-9][0-9]{9}$/.test(indianNumber);
        }
        
        // Check for +91 format
        if (value.startsWith('+91')) {
          const numberPart = cleanNumber.substring(2);
          return numberPart.length === 10 && /^[6-9][0-9]{9}$/.test(numberPart);
        }
        
        return false;
      }, "Please enter a valid Indian mobile number (10 digits starting with 6-9)"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
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

