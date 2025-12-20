// src/applications/applications.controller.ts
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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { FilterApplicationsDto } from './dto/filter-applications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * Apply to a job (applicant only)
   */
  @Post()
  @Roles(Role.APPLICANT)
  async create(
    @CurrentUser() currentUser: any,
    @Body() createDto: CreateApplicationDto,
  ) {
    const application = await this.applicationsService.create(
      currentUser.userId,
      createDto,
    );

    return {
      message: 'Application submitted successfully',
      application,
    };
  }

  /**
   * Get my applications (applicant only)
   */
  @Get('my-applications')
  @Roles(Role.APPLICANT)
  async getMyApplications(
    @CurrentUser() currentUser: any,
    @Query() filterDto: FilterApplicationsDto,
  ) {
    const applications = await this.applicationsService.getMyApplications(
      currentUser.userId,
      filterDto,
    );

    return {
      applications,
      count: applications.length,
    };
  }

  /**
   * Get applicant statistics
   */
  @Get('my-applications/statistics')
  @Roles(Role.APPLICANT)
  async getApplicantStatistics(@CurrentUser() currentUser: any) {
    return this.applicationsService.getApplicantStatistics(currentUser.userId);
  }

  /**
   * Get all applications for employer
   */
  @Get('employer/all')
  @Roles(Role.EMPLOYER)
  async getEmployerApplications(
    @CurrentUser() currentUser: any,
    @Query() filterDto: FilterApplicationsDto,
  ) {
    const applications = await this.applicationsService.getEmployerApplications(
      currentUser.userId,
      filterDto,
    );

    return {
      applications,
      count: applications.length,
    };
  }

  /**
   * Get applications for a specific job (employer only)
   */
  @Get('job/:jobId')
  @Roles(Role.EMPLOYER)
  async getJobApplications(
    @Param('jobId') jobId: string,
    @CurrentUser() currentUser: any,
    @Query() filterDto: FilterApplicationsDto,
  ) {
    const applications = await this.applicationsService.getJobApplications(
      jobId,
      currentUser.userId,
      filterDto,
    );

    return {
      applications,
      count: applications.length,
    };
  }

  /**
   * Check if user has applied to a job
   */
  @Get('check/:jobId')
  @Roles(Role.APPLICANT)
  async checkApplication(
    @Param('jobId') jobId: string,
    @CurrentUser() currentUser: any,
  ) {
    const hasApplied = await this.applicationsService.hasApplied(
      currentUser.userId,
      jobId,
    );

    return {
      hasApplied,
    };
  }

  /**
   * Get application by ID
   */
  @Get(':id')
  async getApplication(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    const application = await this.applicationsService.findById(id);

    if (!application) {
      return {
        application: null,
      };
    }

    // Check access
    const isApplicant =
      application.applicantProfile.user.id === currentUser.userId;
    const isEmployer =
      application.jobPosting.employerProfile.userId === currentUser.userId;

    if (!isApplicant && !isEmployer) {
      return {
        message: 'Access denied',
      };
    }

    return {
      application,
    };
  }

  /**
   * Get application activities
   */
  @Get(':id/activities')
  async getActivities(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    const activities = await this.applicationsService.getActivities(
      id,
      currentUser.userId,
    );

    return {
      activities,
      count: activities.length,
    };
  }

  /**
   * Update application status (employer only)
   */
  @Patch(':id/status')
  @Roles(Role.EMPLOYER)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.applicationsService.updateStatus(
      id,
      currentUser.userId,
      updateDto,
    );

    return {
      message: 'Application status updated successfully',
      application,
    };
  }

  /**
   * Add note to application (employer only)
   */
  @Post(':id/notes')
  @Roles(Role.EMPLOYER)
  async addNote(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Body() addNoteDto: AddNoteDto,
  ) {
    const activity = await this.applicationsService.addNote(
      id,
      currentUser.userId,
      addNoteDto,
    );

    return {
      message: 'Note added successfully',
      activity,
    };
  }

  /**
   * Withdraw application (applicant only)
   */
  @Delete(':id')
  @Roles(Role.APPLICANT)
  @HttpCode(HttpStatus.OK)
  async withdraw(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const application = await this.applicationsService.withdraw(
      id,
      currentUser.userId,
    );

    return {
      message: 'Application withdrawn successfully',
      application,
    };
  }
}
