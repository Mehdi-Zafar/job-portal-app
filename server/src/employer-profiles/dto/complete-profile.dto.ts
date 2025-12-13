// src/employer-profiles/dto/complete-profile.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CompleteEmployerProfileDto {
  // Step 1: Company Information
  @IsString()
  companyName: string;

  @IsString()
  industry: string;

  @IsString()
  companySize: string;

  @IsOptional()
  @IsString()
  companyWebsite?: string;

  // Step 2: Company Description
  @IsString()
  companyDescription: string;

  @IsOptional()
  @IsString()
  companyCulture?: string;

  // Step 3: Contact Details
  @IsString()
  contactPersonName: string;

  @IsString()
  contactPersonDesignation: string;

  @IsString()
  companyPhone: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  // Step 4: Branding
  @IsOptional()
  @IsString()
  companyLogoUrl?: string;
}