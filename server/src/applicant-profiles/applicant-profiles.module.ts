import { Module } from '@nestjs/common';
import { ApplicantProfilesController } from './applicant-profiles.controller';
import { ApplicantProfilesService } from './applicant-profiles.service';

@Module({
  controllers: [ApplicantProfilesController],
  providers: [ApplicantProfilesService]
})
export class ApplicantProfilesModule {}
