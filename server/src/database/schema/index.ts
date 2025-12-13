// src/database/schema/index.ts
// Export all tables
export * from './users.schema';
export * from './profiles.schema';
export * from './skills.schema';
export * from './jobs.schema';
export * from './applications.schema';

// Export all schemas for Drizzle ORM
import { users, userRoles, usersRelations, userRolesRelations } from './users.schema';
import {
  applicantProfiles,
  employerProfiles,
  applicantProfilesRelations,
  employerProfilesRelations,
} from './profiles.schema';
import { skills, skillsRelations } from './skills.schema';
import { jobPostings, jobPostingsRelations } from './jobs.schema';
import {
  applicantSkills,
  jobRequiredSkills,
  jobApplications,
  applicationActivities,
  applicantSkillsRelations,
  jobRequiredSkillsRelations,
  jobApplicationsRelations,
  applicationActivitiesRelations,
} from './applications.schema';

export const schema = {
  // Users
  users,
  userRoles,
  usersRelations,
  userRolesRelations,
  
  // Profiles
  applicantProfiles,
  employerProfiles,
  applicantProfilesRelations,
  employerProfilesRelations,
  
  // Skills
  skills,
  skillsRelations,
  
  // Jobs
  jobPostings,
  jobPostingsRelations,
  
  // Applications
  applicantSkills,
  jobRequiredSkills,
  jobApplications,
  applicationActivities,
  applicantSkillsRelations,
  jobRequiredSkillsRelations,
  jobApplicationsRelations,
  applicationActivitiesRelations,
};