// src/jobs/dto/create-job.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  EmploymentType,
  WorkplaceType,
  EducationLevel,
  ExperienceLevel,
  SalaryType,
  ApplicationMethod,
  TravelRequirement,
  JobStatus,
} from '../../common/enums';

class SkillRequirementDto {
  @IsString()
  skillName: string;

  @IsBoolean()
  isRequired: boolean;
}

export class CreateJobDto {
  // Basic Information
  @IsString()
  jobTitle: string;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsEnum(WorkplaceType)
  workplaceType: WorkplaceType;

  @IsString()
  location: string;

  @IsString()
  department: string;

  @IsNumber()
  @Min(1)
  numberOfOpenings: number;

  // Job Description
  @IsString()
  jobSummary: string;

  @IsString()
  jobDescription: string;

  @IsArray()
  @IsString({ each: true })
  responsibilities: string[];

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  // Qualifications
  @IsEnum(EducationLevel)
  educationLevel: EducationLevel;

  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  // Skills
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillRequirementDto)
  skills?: SkillRequirementDto[];

  // Compensation
  @IsBoolean()
  showSalary: boolean;

  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType;

  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsBoolean()
  hasEquity: boolean;

  // Application Settings
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsEnum(ApplicationMethod)
  applicationMethod: ApplicationMethod;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  screeningQuestions?: string[];

  @IsBoolean()
  visaSponsorship: boolean;

  @IsEnum(TravelRequirement)
  travelRequirement: TravelRequirement;

  // Status
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
