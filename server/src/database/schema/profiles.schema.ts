// src/database/schema/profiles.schema.ts
import { pgTable, uuid, varchar, text, boolean, integer, decimal, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { applicantSkills, jobApplications } from './applications.schema';
import { jobPostings } from './jobs.schema';

// Enums
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
export const experienceLevelEnum = pgEnum('experience_level', ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']);

// Applicant Profiles
export const applicantProfiles = pgTable('applicant_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  profileImageUrl: text('profile_image_url'),
  resumeUrl: text('resume_url'),
  currentTitle: varchar('current_title', { length: 255 }),
  professionalSummary: text('professional_summary'),
  currentLocation: varchar('current_location', { length: 255 }),
  willingToRelocate: boolean('willing_to_relocate').default(false),
  experienceLevel: experienceLevelEnum('experience_level'),
  yearsOfExperience: integer('years_of_experience').default(0),
  expectedSalaryMin: decimal('expected_salary_min', { precision: 10, scale: 2 }),
  expectedSalaryMax: decimal('expected_salary_max', { precision: 10, scale: 2 }),
  isProfileComplete: boolean('is_profile_complete').default(false),
  completionPercentage: integer('completion_percentage').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Employer Profiles
export const employerProfiles = pgTable('employer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  companySize: varchar('company_size', { length: 50 }),
  industry: varchar('industry', { length: 100 }),
  companyWebsite: text('company_website'),
  companyDescription: text('company_description'),
  companyLogoUrl: text('company_logo_url'),
  contactPersonName: varchar('contact_person_name', { length: 255 }),
  contactPersonDesignation: varchar('contact_person_designation', { length: 100 }),
  companyAddress: text('company_address'),
  companyPhone: varchar('company_phone', { length: 20 }),
  isVerified: boolean('is_verified').default(false),
  isProfileComplete: boolean('is_profile_complete').default(false),
  completionPercentage: integer('completion_percentage').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const applicantProfilesRelations = relations(applicantProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [applicantProfiles.userId],
    references: [users.id],
  }),
  skills: many(applicantSkills),
  applications: many(jobApplications),
}));

export const employerProfilesRelations = relations(employerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [employerProfiles.userId],
    references: [users.id],
  }),
  jobPostings: many(jobPostings),
}));