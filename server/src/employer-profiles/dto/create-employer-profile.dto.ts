// src/employer-profiles/dto/create-employer-profile.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEmployerProfileDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @IsOptional()
  @IsString()
  companyDescription?: string;

  @IsOptional()
  @IsString()
  contactPersonName?: string;

  @IsOptional()
  @IsString()
  contactPersonDesignation?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;
}