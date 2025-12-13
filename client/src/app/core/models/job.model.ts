import { Skill } from "./profile.model";

// src/app/core/models/job.model.ts
export interface Job {
  id: string;
  jobTitle: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  department: string;
  numberOfOpenings: number;
  jobSummary: string;
  jobDescription: string;
  responsibilities: string[];
  requirements: string[];
  educationLevel: string;
  experienceLevel: string;
  yearsOfExperience: number;
  showSalary: boolean;
  salaryType?: string;
  salaryMin?: string;
  salaryMax?: string;
  currency?: string;
  benefits?: string[];
  hasEquity: boolean;
  applicationDeadline?: string;
  applicationMethod: string;
  externalUrl?: string;
  screeningQuestions?: string[];
  visaSponsorship: boolean;
  travelRequirement: string;
  status: string;
  viewCount?: number;
  applicationCount?: number;
  postedDate?: string;
  employerProfile?: {
    id: string;
    companyName: string;
    companyLogoUrl?: string;
    industry?: string;
    isVerified: boolean;
  };
  requiredSkills?: JobSkill[];
}

export interface JobSkill {
  skill: Skill;
  isRequired: boolean;
}

export interface CreateJobRequest {
  jobTitle: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  department: string;
  numberOfOpenings: number;
  jobSummary: string;
  jobDescription: string;
  responsibilities: string[];
  requirements: string[];
  educationLevel: string;
  experienceLevel: string;
  yearsOfExperience: number;
  skills?: SkillRequirement[];
  showSalary: boolean;
  salaryType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  benefits?: string[];
  hasEquity: boolean;
  applicationDeadline?: string;
  applicationMethod: string;
  externalUrl?: string;
  screeningQuestions?: string[];
  visaSponsorship: boolean;
  travelRequirement: string;
  status?: string;
}

export interface SkillRequirement {
  skillName: string;
  isRequired: boolean;
}

export interface SearchJobsParams {
  query?: string;
  location?: string;
  employmentType?: string;
  workplaceType?: string;
  department?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string;
  limit?: number;
  offset?: number;
}