// src/database/schema/applications.schema.ts
import { pgTable, uuid, text, boolean, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { applicantProfiles } from './profiles.schema';
import { jobPostings } from './jobs.schema';
import { skills } from './skills.schema';

// Enums
export const applicationStatusEnum = pgEnum('application_status', [
  'SUBMITTED',
  'REVIEWED',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'OFFERED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]);

export const proficiencyLevelEnum = pgEnum('proficiency_level', ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

// Applicant Skills (junction table)
export const applicantSkills = pgTable('applicant_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicantProfileId: uuid('applicant_profile_id')
    .notNull()
    .references(() => applicantProfiles.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id')
    .notNull()
    .references(() => skills.id, { onDelete: 'cascade' }),
  proficiencyLevel: proficiencyLevelEnum('proficiency_level'),
  yearsOfExperience: integer('years_of_experience'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Job Required Skills (junction table)
export const jobRequiredSkills = pgTable('job_required_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobPostingId: uuid('job_posting_id')
    .notNull()
    .references(() => jobPostings.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id')
    .notNull()
    .references(() => skills.id, { onDelete: 'cascade' }),
  isRequired: boolean('is_required').default(true), // true = required, false = preferred
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Job Applications
export const jobApplications = pgTable('job_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobPostingId: uuid('job_posting_id')
    .notNull()
    .references(() => jobPostings.id, { onDelete: 'cascade' }),
  applicantProfileId: uuid('applicant_profile_id')
    .notNull()
    .references(() => applicantProfiles.id, { onDelete: 'cascade' }),
  coverLetter: text('cover_letter'),
  resumeUrl: text('resume_url'), // Can override applicant's default resume
  screeningAnswers: text('screening_answers').array(), // Array of answers to screening questions
  status: applicationStatusEnum('status').default('SUBMITTED').notNull(),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Application Activities (audit log)
export const applicationActivities = pgTable('application_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id')
    .notNull()
    .references(() => jobApplications.id, { onDelete: 'cascade' }),
  performedByUserId: uuid('performed_by_user_id'), // Can be null for system actions
  action: text('action').notNull(), // e.g., 'status_changed', 'note_added', 'interview_scheduled'
  oldStatus: applicationStatusEnum('old_status'),
  newStatus: applicationStatusEnum('new_status'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const applicantSkillsRelations = relations(applicantSkills, ({ one }) => ({
  applicantProfile: one(applicantProfiles, {
    fields: [applicantSkills.applicantProfileId],
    references: [applicantProfiles.id],
  }),
  skill: one(skills, {
    fields: [applicantSkills.skillId],
    references: [skills.id],
  }),
}));

export const jobRequiredSkillsRelations = relations(jobRequiredSkills, ({ one }) => ({
  jobPosting: one(jobPostings, {
    fields: [jobRequiredSkills.jobPostingId],
    references: [jobPostings.id],
  }),
  skill: one(skills, {
    fields: [jobRequiredSkills.skillId],
    references: [skills.id],
  }),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one, many }) => ({
  jobPosting: one(jobPostings, {
    fields: [jobApplications.jobPostingId],
    references: [jobPostings.id],
  }),
  applicantProfile: one(applicantProfiles, {
    fields: [jobApplications.applicantProfileId],
    references: [applicantProfiles.id],
  }),
  activities: many(applicationActivities),
}));

export const applicationActivitiesRelations = relations(applicationActivities, ({ one }) => ({
  application: one(jobApplications, {
    fields: [applicationActivities.applicationId],
    references: [jobApplications.id],
  }),
}));