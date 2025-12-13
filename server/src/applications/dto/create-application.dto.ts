// src/applications/dto/create-application.dto.ts
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  jobPostingId: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string; // Can override default resume

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  screeningAnswers?: string[];
}