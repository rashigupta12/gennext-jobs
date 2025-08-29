import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  integer,
  json,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";

// User Role Enum
export const UserRole = pgEnum("user_role", ["ADMIN", "USER","RECRUITER" , "SUPER_ADMIN"]);

// Employment Type Enum
export const EmploymentType = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]);

// =====================
// Users Table
// =====================
export const UsersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    password: text("password").notNull(),
    mobile: text("mobile"),
    profile: text("profile"),
    role: UserRole("role").default("USER").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    companyId: text("company_id"),
    defaultpassword:text("default_password")
  

  },
  (table) => [
    uniqueIndex("users_email_key").on(table.email),
    index("users_name_email_mobile_idx").on(
      table.name,
      table.email,
      table.mobile
    ),
  ]
);

// TypeScript Type for Users Table
export type User = InferModel<typeof UsersTable>; // SELECT (Read)
export type NewUser = InferModel<typeof UsersTable, "insert">; // INSERT (Create)

// =====================
// Resumes Table
// =====================
export const ResumesTable = pgTable(
  "resumes",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    resumeUrl: text("resume_url").notNull(), // Resume file as URL
    experience: text("experience"), // Work experience details
    skills: text("skills"), // Comma-separated skills
    education: text("education"), // Education details
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    position: text("positions")
    
  },
  (table) => [index("resumes_user_id_idx").on(table.userId)]
);

// TypeScript Type for Resumes Table
export type Resume = InferModel<typeof ResumesTable>; // SELECT (Read)
export type NewResume = InferModel<typeof ResumesTable, "insert">; // INSERT (Create)

// =====================
// Categories Table
// =====================
export const CategoriesTable = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_name_key").on(table.name),
    uniqueIndex("categories_slug_key").on(table.slug),
  ]
);

// TypeScript Type for Categories Table
export type Category = InferModel<typeof CategoriesTable>;
export type NewCategory = InferModel<typeof CategoriesTable, "insert">;

// =====================
// Subcategories Table
// =====================
export const SubcategoriesTable = pgTable(
  "subcategories",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => CategoriesTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("subcategories_category_id_name_key").on(
      table.categoryId,
      table.name
    ),
    uniqueIndex("subcategories_slug_key").on(table.slug),
    index("subcategories_category_id_idx").on(table.categoryId),
  ]
);

// TypeScript Type for Subcategories Table
export type Subcategory = InferModel<typeof SubcategoriesTable>;
export type NewSubcategory = InferModel<typeof SubcategoriesTable, "insert">;

// =====================
// Companies Table
// =====================
export const CompaniesTable = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    createdBy: uuid("user_id")
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    recruiter: text("recruiter").array(),
    name: varchar("name", { length: 100 }).notNull(),
    logo: text("logo"),
    website: text("website"),
    about: text("about"),
    address: text("address"),
    industry: varchar("industry", { length: 100 }),
    rating: varchar("rating", { length: 10 }),
    isVerified: boolean("is_verified").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    adminId : uuid("admin_id")
  },
  (table) => [
    uniqueIndex("companies_name_key").on(table.name),
  ]
);

// TypeScript Type for Companies Table
export type Company = InferModel<typeof CompaniesTable>;
export type NewCompany = InferModel<typeof CompaniesTable, "insert">;

// =====================
// Job Listings Table
// =====================
export const JobListingsTable = pgTable(
  "job_listings",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 255 }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => CategoriesTable.id),
    subcategoryId: uuid("subcategory_id").references(() => SubcategoriesTable.id),
    companyId: uuid("company_id")
      .notNull()
      .references(() => CompaniesTable.id),
    duration: varchar("duration", { length: 50 }),
    salary: varchar("salary", { length: 100 }),
    location: varchar("location", { length: 100 }),
    startDate: varchar("start_date", { length: 100 }),
    applicantsCount: integer("applicants_count").default(0),
    openings: integer("openings").default(1),
    description: text("description"),
    highlights: json("highlights").$type<string[]>(),
    qualifications: json("qualifications").$type<string[]>(),
    skills: json("skills").$type<string[]>(),
    role: varchar("role", { length: 100 }),
    department: varchar("department", { length: 100 }),
    employmentType: EmploymentType("employment_type").default("FULL_TIME"),
    education: varchar("education", { length: 200 }),
    isFeatured: boolean("is_featured").default(false),
    isActive: boolean("is_active").default(true),
    postedAt: timestamp("posted_at").defaultNow(),
    expiresAt: text("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("job_listings_slug_key").on(table.slug),
    index("job_listings_category_id_idx").on(table.categoryId),
    index("job_listings_subcategory_id_idx").on(table.subcategoryId),
    index("job_listings_company_id_idx").on(table.companyId),
    index("job_listings_employment_type_idx").on(table.employmentType),
    index("job_listings_is_featured_idx").on(table.isFeatured),
    index("job_listings_is_active_idx").on(table.isActive),
    index("job_listings_posted_at_idx").on(table.postedAt),
  ]
);

// TypeScript Type for Job Listings Table
export type JobListing = InferModel<typeof JobListingsTable>;
export type NewJobListing = InferModel<typeof JobListingsTable, "insert">;

// =====================
// Job Applications Table
// =====================
export const JobApplicationsTable = pgTable(
  "job_applications",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => JobListingsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => ResumesTable.id),
    coverLetter: text("cover_letter"),
    status: text("status"),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("job_applications_job_id_user_id_key").on(
      table.jobId,
      table.userId
    ),
    index("job_applications_job_id_idx").on(table.jobId),
    index("job_applications_user_id_idx").on(table.userId),
    index("job_applications_status_idx").on(table.status),
  ]
);

// TypeScript Type for Job Applications Table
export type JobApplication = InferModel<typeof JobApplicationsTable>;
export type NewJobApplication = InferModel<typeof JobApplicationsTable, "insert">;

// =====================
// Authentication Tables
// =====================

// Email Verification Tokens
export const EmailVerificationTokenTable = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("email_verification_tokens_email_token_key").on(
      table.email,
      table.token
    ),
    uniqueIndex("email_verification_tokens_token_key").on(table.token),
  ]
);

// TypeScript Type for Email Verification Token
export type EmailVerificationToken = InferModel<
  typeof EmailVerificationTokenTable
>;
export type NewEmailVerificationToken = InferModel<
  typeof EmailVerificationTokenTable,
  "insert"
>;

// Password Reset Tokens
export const PasswordResetTokenTable = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_email_token_key").on(
      table.email,
      table.token
    ),
    uniqueIndex("password_reset_tokens_token_key").on(table.token),
  ]
);

// TypeScript Type for Password Reset Token
export type PasswordResetToken = InferModel<typeof PasswordResetTokenTable>;
export type NewPasswordResetToken = InferModel<
  typeof PasswordResetTokenTable,
  "insert"
>;