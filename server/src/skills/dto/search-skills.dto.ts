// src/skills/dto/search-skills.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class SearchSkillsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  category?: string;
}