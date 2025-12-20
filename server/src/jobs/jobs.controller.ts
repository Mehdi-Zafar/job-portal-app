// src/jobs/jobs.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { EmailVerifiedGuard } from 'src/common/guards/email-verified/email-verified.guard';
import { AllowUnverified } from 'src/common/decorators/allow-unverified.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * Create job posting
   */
  @Post()
  @Roles(Role.EMPLOYER)
  async create(
    @CurrentUser() currentUser: any,
    @Body() createDto: CreateJobDto,
  ) {
    const job = await this.jobsService.create(currentUser.userId, createDto);

    return {
      message: 'Job posted successfully',
      job,
    };
  }

  /**
   * Get all jobs (public with filters)
   */
  @Get()
  @AllowUnverified()
  @Public()
  async findAll(@Query() searchDto: SearchJobsDto) {
    const jobs = await this.jobsService.findAll(searchDto);

    return {
      jobs,
      count: jobs.length,
    };
  }

  /**
   * Search jobs (public)
   */
  @Get('search')
  @AllowUnverified()
  @Public()
  async search(@Query() searchDto: SearchJobsDto) {
    const jobs = await this.jobsService.search(searchDto);

    return {
      jobs,
      count: jobs.length,
    };
  }

  /**
   * Get my jobs (employer only)
   */
  @Get('my-jobs')
  @Roles(Role.EMPLOYER)
  async getMyJobs(@CurrentUser() currentUser: any) {
    const jobs = await this.jobsService.findByEmployer(currentUser.userId);

    return {
      jobs,
      count: jobs.length,
    };
  }

  /**
   * Get employer statistics
   */
  @Get('my-jobs/statistics')
  @Roles(Role.EMPLOYER)
  async getStatistics(@CurrentUser() currentUser: any) {
    return this.jobsService.getEmployerStatistics(currentUser.userId);
  }

  /**
   * Get job by ID (public)
   */
  @Get(':id')
  @Public()
  async findById(@Param('id') id: string) {
    const job = await this.jobsService.findById(id);

    return {
      job,
    };
  }

  /**
   * Get similar jobs (public)
   */
  @Get(':id/similar')
  @Public()
  async getSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
    const jobs = await this.jobsService.getSimilarJobs(
      id,
      limit ? parseInt(limit) : 5,
    );

    return {
      jobs,
      count: jobs.length,
    };
  }

  /**
   * Update job
   */
  @Patch(':id')
  @Roles(Role.EMPLOYER)
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Body() updateDto: UpdateJobDto,
  ) {
    const job = await this.jobsService.update(
      id,
      currentUser.userId,
      updateDto,
    );

    return {
      message: 'Job updated successfully',
      job,
    };
  }

  /**
   * Update job status
   */
  @Patch(':id/status')
  @Roles(Role.EMPLOYER)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Body() updateStatusDto: UpdateJobStatusDto,
  ) {
    const job = await this.jobsService.updateStatus(
      id,
      currentUser.userId,
      updateStatusDto.status,
    );

    return {
      message: 'Job status updated successfully',
      job,
    };
  }

  /**
   * Duplicate job
   */
  @Post(':id/duplicate')
  @Roles(Role.EMPLOYER)
  async duplicate(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const job = await this.jobsService.duplicate(id, currentUser.userId);

    return {
      message: 'Job duplicated successfully',
      job,
    };
  }

  /**
   * Delete job
   */
  @Delete(':id')
  @Roles(Role.EMPLOYER)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.jobsService.delete(id, currentUser.userId);
  }
}
