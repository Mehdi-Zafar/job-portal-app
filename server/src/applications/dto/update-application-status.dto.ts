// src/applications/dto/update-application-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
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
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}