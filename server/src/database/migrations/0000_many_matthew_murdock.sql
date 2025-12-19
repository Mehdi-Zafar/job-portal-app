CREATE TYPE "public"."user_role" AS ENUM('APPLICANT', 'EMPLOYER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');--> statement-breakpoint
CREATE TYPE "public"."application_method" AS ENUM('PLATFORM', 'EXTERNAL');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."salary_type" AS ENUM('ANNUAL', 'MONTHLY', 'HOURLY');--> statement-breakpoint
CREATE TYPE "public"."travel_requirement" AS ENUM('NONE', 'OCCASIONAL', 'FREQUENT', 'EXTENSIVE');--> statement-breakpoint
CREATE TYPE "public"."workplace_type" AS ENUM('ON_SITE', 'REMOTE', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."proficiency_level" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" varchar(255),
	"email_verification_expires" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp,
	"refresh_token" text,
	"refresh_token_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "applicant_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"date_of_birth" date,
	"gender" "gender",
	"profile_image_url" text,
	"resume_url" text,
	"current_title" varchar(255),
	"professional_summary" text,
	"current_location" varchar(255),
	"willing_to_relocate" boolean DEFAULT false,
	"experience_level" "experience_level",
	"years_of_experience" integer DEFAULT 0,
	"expected_salary_min" integer,
	"expected_salary_max" integer,
	"is_profile_complete" boolean DEFAULT false,
	"completion_percentage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applicant_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "employer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"company_size" varchar(50),
	"industry" varchar(100),
	"company_website" text,
	"company_description" text,
	"company_logo_url" text,
	"contact_person_name" varchar(255),
	"contact_person_designation" varchar(100),
	"company_address" text,
	"company_phone" varchar(20),
	"is_verified" boolean DEFAULT false,
	"is_profile_complete" boolean DEFAULT false,
	"completion_percentage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_profile_id" uuid NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"employment_type" "employment_type" NOT NULL,
	"workplace_type" "workplace_type" NOT NULL,
	"location" varchar(255),
	"department" varchar(100) NOT NULL,
	"number_of_openings" integer DEFAULT 1 NOT NULL,
	"job_summary" text NOT NULL,
	"job_description" text NOT NULL,
	"responsibilities" text[] NOT NULL,
	"requirements" text[] NOT NULL,
	"education_level" "education_level" NOT NULL,
	"experience_level" varchar(50) NOT NULL,
	"years_of_experience" integer DEFAULT 0 NOT NULL,
	"show_salary" boolean DEFAULT true,
	"salary_type" "salary_type",
	"salary_min" integer,
	"salary_max" integer,
	"currency" varchar(10) DEFAULT 'USD',
	"benefits" text[],
	"has_equity" boolean DEFAULT false,
	"application_deadline" date,
	"application_method" "application_method" DEFAULT 'PLATFORM' NOT NULL,
	"external_url" text,
	"screening_questions" text[],
	"visa_sponsorship" boolean DEFAULT false,
	"travel_requirement" "travel_requirement" DEFAULT 'NONE',
	"status" "job_status" DEFAULT 'DRAFT' NOT NULL,
	"view_count" integer DEFAULT 0,
	"application_count" integer DEFAULT 0,
	"posted_date" timestamp,
	"closed_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applicant_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_profile_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"proficiency_level" "proficiency_level",
	"years_of_experience" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"performed_by_user_id" uuid,
	"action" text NOT NULL,
	"old_status" "application_status",
	"new_status" "application_status",
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"applicant_profile_id" uuid NOT NULL,
	"cover_letter" text,
	"resume_url" text,
	"screening_answers" text[],
	"status" "application_status" DEFAULT 'SUBMITTED' NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_required_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_employer_profile_id_employer_profiles_id_fk" FOREIGN KEY ("employer_profile_id") REFERENCES "public"."employer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_skills" ADD CONSTRAINT "applicant_skills_applicant_profile_id_applicant_profiles_id_fk" FOREIGN KEY ("applicant_profile_id") REFERENCES "public"."applicant_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_skills" ADD CONSTRAINT "applicant_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_activities" ADD CONSTRAINT "application_activities_application_id_job_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_applicant_profile_id_applicant_profiles_id_fk" FOREIGN KEY ("applicant_profile_id") REFERENCES "public"."applicant_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_required_skills" ADD CONSTRAINT "job_required_skills_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_required_skills" ADD CONSTRAINT "job_required_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;