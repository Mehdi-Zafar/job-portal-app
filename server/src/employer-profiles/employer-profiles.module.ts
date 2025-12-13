// src/employer-profiles/employer-profiles.module.ts
import { Module } from '@nestjs/common';
import { EmployerProfilesController } from './employer-profiles.controller';
import { EmployerProfilesService } from './employer-profiles.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployerProfilesController],
  providers: [EmployerProfilesService],
  exports: [EmployerProfilesService],
})
export class EmployerProfilesModule {}