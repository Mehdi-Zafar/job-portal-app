// src/jobs/dto/search-jobs.dto.ts
import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class SearchJobsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'])
  employmentType?: string;

  @IsOptional()
  @IsEnum(['ON_SITE', 'REMOTE', 'HYBRID'])
  workplaceType?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @IsOptional()
  @IsString()
  skills?: string; // Comma-separated skill names

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}