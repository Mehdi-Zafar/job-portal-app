// src/app/core/models/profile.model.ts
export interface ApplicantProfile {
  id: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  currentTitle?: string;
  professionalSummary?: string;
  currentLocation?: string;
  willingToRelocate?: boolean;
  experienceLevel?: string;
  yearsOfExperience?: number;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  resumeUrl?: string;
  profileImageUrl?: string;
  isProfileComplete: boolean;
  completionPercentage: number;
  skills?: ApplicantSkill[];
}

export interface ApplicantSkill {
  id: string;
  skill: Skill;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface EmployerProfile {
  id: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyLogoUrl?: string;
  contactPersonName?: string;
  contactPersonDesignation?: string;
  companyPhone?: string;
  companyAddress?: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  completionPercentage: number;
}