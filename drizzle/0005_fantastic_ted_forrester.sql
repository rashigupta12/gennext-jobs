ALTER TABLE "job_applications" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" DROP NOT NULL;