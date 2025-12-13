// src/skills/dto/update-skill.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}