// src/applicant-profiles/dto/update-applicant-profile.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantProfileDto } from './create-applicant-profile.dto';

export class UpdateApplicantProfileDto extends PartialType(CreateApplicantProfileDto) {}