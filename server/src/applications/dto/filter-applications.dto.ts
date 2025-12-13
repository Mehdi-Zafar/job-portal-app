// src/applications/dto/filter-applications.dto.ts
import { IsOptional, IsEnum, IsUUID, IsNumber } from 'class-validator';

export class FilterApplicationsDto {
  @IsOptional()
  @IsUUID()
  jobPostingId?: string;

  @IsOptional()
  @IsEnum([
    'SUBMITTED',
    'REVIEWED',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'INTERVIEWED',
    'OFFERED',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
  ])
  status?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}