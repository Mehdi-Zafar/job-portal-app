// src/applicant-profiles/dto/complete-profile.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class SkillDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  proficiencyLevel?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;
}

export class CompleteProfileDto {
  // Step 1: Basic Information
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsString()
  currentLocation: string;

  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: string;

  // Step 2: Professional Information
  @IsString()
  currentTitle: string;

  @IsNumber()
  yearsOfExperience: number;

  @IsString()
  professionalSummary: string;

  @IsOptional()
  @IsEnum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'])
  experienceLevel?: string;

  @IsOptional()
  @IsBoolean()
  willingToRelocate?: boolean;

  @IsOptional()
  @IsNumber()
  expectedSalaryMin?: number;

  @IsOptional()
  @IsNumber()
  expectedSalaryMax?: number;

  // Step 3: Skills & Expertise
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills: SkillDto[];

  // Step 4: Resume URL (will be uploaded separately)
  @IsOptional()
  @IsString()
  resumeUrl?: string;
}