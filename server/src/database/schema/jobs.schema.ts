// src/database/schema/jobs.schema.ts
import { pgTable, uuid, varchar, text, boolean, integer, decimal, timestamp, pgEnum, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { employerProfiles } from './profiles.schema';
import { jobRequiredSkills, jobApplications } from './applications.schema';
import { ApplicationMethod, EducationLevel, EmploymentType, JobStatus, SalaryType, TravelRequirement, WorkplaceType } from 'src/common/enums';
import { enumValues } from 'src/common/helpers/enum.helper';

// Enums
export const employmentTypeEnum = pgEnum('employment_type', enumValues(EmploymentType));

export const workplaceTypeEnum = pgEnum('workplace_type', enumValues(WorkplaceType));

export const jobStatusEnum = pgEnum('job_status', enumValues(JobStatus));

export const educationLevelEnum = pgEnum('education_level', enumValues(EducationLevel));

export const salaryTypeEnum = pgEnum('salary_type', enumValues(SalaryType));

export const travelRequirementEnum = pgEnum('travel_requirement', enumValues(TravelRequirement));

export const applicationMethodEnum = pgEnum('application_method', enumValues(ApplicationMethod));

// Job Postings
export const jobPostings = pgTable('job_postings', {
  id: uuid('id').primaryKey().defaultRandom(),
  employerProfileId: uuid('employer_profile_id')
    .notNull()
    .references(() => employerProfiles.id, { onDelete: 'cascade' }),
  
  // Basic Information
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  employmentType: employmentTypeEnum('employment_type').notNull(),
  workplaceType: workplaceTypeEnum('workplace_type').notNull(),
  location: varchar('location', { length: 255 }),
  department: varchar('department', { length: 100 }).notNull(),
  numberOfOpenings: integer('number_of_openings').default(1).notNull(),
  
  // Job Description
  jobSummary: text('job_summary').notNull(),
  jobDescription: text('job_description').notNull(),
  responsibilities: text('responsibilities').array().notNull(), // Array of strings
  requirements: text('requirements').array().notNull(), // Array of strings
  
  // Qualifications
  educationLevel: educationLevelEnum('education_level').notNull(),
  experienceLevel: varchar('experience_level', { length: 50 }).notNull(),
  yearsOfExperience: integer('years_of_experience').default(0).notNull(),
  
  // Compensation
  showSalary: boolean('show_salary').default(true),
  salaryType: salaryTypeEnum('salary_type'),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  currency: varchar('currency', { length: 10 }).default('USD'),
  benefits: text('benefits').array(), // Array of benefit strings
  hasEquity: boolean('has_equity').default(false),
  
  // Application Settings
  applicationDeadline: date('application_deadline'),
  applicationMethod: applicationMethodEnum('application_method').default('PLATFORM').notNull(),
  externalUrl: text('external_url'),
  screeningQuestions: text('screening_questions').array(), // Array of questions
  visaSponsorship: boolean('visa_sponsorship').default(false),
  travelRequirement: travelRequirementEnum('travel_requirement').default('NONE'),
  
  // Status & Metadata
  status: jobStatusEnum('status').default('DRAFT').notNull(),
  viewCount: integer('view_count').default(0),
  applicationCount: integer('application_count').default(0),
  postedDate: timestamp('posted_date'),
  closedDate: timestamp('closed_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  employerProfile: one(employerProfiles, {
    fields: [jobPostings.employerProfileId],
    references: [employerProfiles.id],
  }),
  requiredSkills: many(jobRequiredSkills),
  applications: many(jobApplications),
}));