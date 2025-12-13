// src/applicant-profiles/dto/add-skill.dto.ts
import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class AddSkillDto {
  @IsString()
  skillName: string;

  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  proficiencyLevel?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;
}