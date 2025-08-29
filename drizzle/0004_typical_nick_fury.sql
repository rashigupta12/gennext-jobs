CREATE TYPE "public"."employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"logo" text,
	"website" text,
	"about" text,
	"address" text,
	"industry" varchar(100),
	"rating" varchar(10),
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"resume_id" uuid NOT NULL,
	"cover_letter" text,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(255),
	"category_id" uuid NOT NULL,
	"subcategory_id" uuid,
	"company_id" uuid NOT NULL,
	"duration" varchar(50),
	"salary" varchar(100),
	"location" varchar(100),
	"start_date" varchar(100),
	"applicants_count" integer DEFAULT 0,
	"openings" integer DEFAULT 1,
	"description" text,
	"highlights" json,
	"qualifications" json,
	"skills" json,
	"role" varchar(100),
	"department" varchar(100),
	"employment_type" "employment_type" DEFAULT 'FULL_TIME',
	"education" varchar(200),
	"is_featured" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"posted_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_listings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_key" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_key" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_name_key" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "job_applications_job_id_user_id_key" ON "job_applications" USING btree ("job_id","user_id");--> statement-breakpoint
CREATE INDEX "job_applications_job_id_idx" ON "job_applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_applications_user_id_idx" ON "job_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_applications_status_idx" ON "job_applications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "job_listings_slug_key" ON "job_listings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "job_listings_category_id_idx" ON "job_listings" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "job_listings_subcategory_id_idx" ON "job_listings" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "job_listings_company_id_idx" ON "job_listings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_listings_employment_type_idx" ON "job_listings" USING btree ("employment_type");--> statement-breakpoint
CREATE INDEX "job_listings_is_featured_idx" ON "job_listings" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "job_listings_is_active_idx" ON "job_listings" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "job_listings_posted_at_idx" ON "job_listings" USING btree ("posted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subcategories_category_id_name_key" ON "subcategories" USING btree ("category_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "subcategories_slug_key" ON "subcategories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subcategories_category_id_idx" ON "subcategories" USING btree ("category_id");