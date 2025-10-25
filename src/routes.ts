import { Role } from "./validaton-schema";

export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";

// Prefix for API authentication routes.
export const apiAuthPrefix: string = "/api/auth";

// Routes which are accessible to all (supports both strings and RegExp patterns).
export const publicRoutes: (string | RegExp)[] = [
  "/", 
  "/auth/verify-email", 
  "/aboutUs",
  "/contactUs",
  "/searchResult",
  "/jobs",
  /^\/jobs\/[^/]+$/, // Matches /jobs/{any-id} - dynamic job detail pages
];

// APIs which are accessible to all.
export const publicApis: string[] = [
  "/api/categories", 
  "/api/uploadthing",
  "/api/companies", 
  "/api/job-listing", 
  "/api/search",
  "/api/subCategories",
  "/api/job-location", 
  "/api/send-email"
];

// Routes which are used for authentication.
export const authRoutes: string[] = [
  "/auth/error",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Routes which are protected with different roles
export const protectedRoutes: Record<string, Role[]> = {
  "^/dashboard/admin(/.*)?$": ["ADMIN"],
  "^/dashboard/user(/.*)?$": ["USER"],
};