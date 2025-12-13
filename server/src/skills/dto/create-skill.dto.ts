// src/skills/dto/create-skill.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;
}