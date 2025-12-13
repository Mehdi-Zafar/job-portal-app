// src/jobs/dto/update-job-status.dto.ts
import { IsEnum } from 'class-validator';

export class UpdateJobStatusDto {
  @IsEnum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED'])
  status: string;
}