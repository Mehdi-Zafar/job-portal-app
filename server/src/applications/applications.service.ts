// src/applications/applications.service.ts
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DATABASE_CONNECTION, type Database } from '../database/database.providers';
import {
  jobApplications,
  applicationActivities,
  jobPostings,
  applicantProfiles,
  employerProfiles,
} from '../database/schema';
import { eq, and, desc, sql, SQLWrapper } from 'drizzle-orm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { FilterApplicationsDto } from './dto/filter-applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  /**
   * Apply to a job
   */
  async create(userId: string, createDto: CreateApplicationDto) {
    // Get applicant profile
    const applicantProfile = await this.db.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.userId, userId),
    });

    if (!applicantProfile) {
      throw new NotFoundException('Applicant profile not found');
    }

    if (!applicantProfile.isProfileComplete) {
      throw new ForbiddenException(
        'Please complete your profile before applying to jobs',
      );
    }

    // Get job posting
    const job = await this.db.query.jobPostings.findFirst({
      where: eq(jobPostings.id, createDto.jobPostingId),
      with: {
        employerProfile: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'ACTIVE') {
      throw new BadRequestException('This job is no longer accepting applications');
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Check if user already applied
    const existingApplication = await this.db.query.jobApplications.findFirst({
      where: and(
        eq(jobApplications.jobPostingId, createDto.jobPostingId),
        eq(jobApplications.applicantProfileId, applicantProfile.id),
      ),
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job');
    }

    // Prevent applying to own job (if user has employer role)
    if (job.employerProfile.userId === userId) {
      throw new BadRequestException('You cannot apply to your own job posting');
    }

    return await this.db.transaction(async (tx) => {
      // Create application
      const [application] = await tx
        .insert(jobApplications)
        .values({
          jobPostingId: createDto.jobPostingId,
          applicantProfileId: applicantProfile.id,
          coverLetter: createDto.coverLetter,
          resumeUrl: createDto.resumeUrl || applicantProfile.resumeUrl,
          screeningAnswers: createDto.screeningAnswers || [],
          status: 'SUBMITTED',
        })
        .returning();

      // Create activity log
      await tx.insert(applicationActivities).values({
        applicationId: application.id,
        action: 'application_submitted',
        newStatus: 'SUBMITTED',
        notes: 'Application submitted successfully',
      });

      // Increment application count on job
      await tx
        .update(jobPostings)
        .set({
          applicationCount: sql`${jobPostings.applicationCount} + 1`,
        })
        .where(eq(jobPostings.id, createDto.jobPostingId));

      return application;
    });
  }

  /**
   * Get application by ID with full details
   */
  async findById(id: string) {
    const application = await this.db.query.jobApplications.findFirst({
      where: eq(jobApplications.id, id),
      with: {
        jobPosting: {
          with: {
            employerProfile: {
              columns: {
                id: true,
                companyName: true,
                companyLogoUrl: true,
                userId: true,
              },
            },
          },
        },
        applicantProfile: {
          with: {
            user: {
              columns: {
                id: true,
                username: true,
                email: true,
              },
            },
            skills: {
              with: {
                skill: true,
              },
            },
          },
        },
        activities: {
          orderBy: [desc(applicationActivities.createdAt)],
        },
      },
    });

    return application;
  }

  /**
   * Get my applications (applicant)
   */
  async getMyApplications(userId: string, filterDto: FilterApplicationsDto = {}) {
    const applicantProfile = await this.db.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.userId, userId),
    });

    if (!applicantProfile) {
      throw new NotFoundException('Applicant profile not found');
    }

    const { status, limit = 20, offset = 0 } = filterDto;

    const conditions = [
      eq(jobApplications.applicantProfileId, applicantProfile.id),
    ];

    if (status) {
      conditions.push(eq(jobApplications.status, status as any));
    }

    const applications = await this.db.query.jobApplications.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: [desc(jobApplications.appliedAt)],
      with: {
        jobPosting: {
          with: {
            employerProfile: {
              columns: {
                companyName: true,
                companyLogoUrl: true,
              },
            },
          },
        },
      },
    });

    return applications;
  }

  /**
   * Get applications for a job (employer)
   */
  async getJobApplications(
    jobId: string,
    userId: string,
    filterDto: FilterApplicationsDto = {},
  ) {
    // Get job and verify ownership
    const job = await this.db.query.jobPostings.findFirst({
      where: eq(jobPostings.id, jobId),
      with: {
        employerProfile: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerProfile.userId !== userId) {
      throw new ForbiddenException('You can only view applications for your own jobs');
    }

    const { status, limit = 20, offset = 0 } = filterDto;

    const conditions = [eq(jobApplications.jobPostingId, jobId)];

    if (status) {
      conditions.push(eq(jobApplications.status, status as any));
    }

    const applications = await this.db.query.jobApplications.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: [desc(jobApplications.appliedAt)],
      with: {
        applicantProfile: {
          with: {
            user: {
              columns: {
                username: true,
                email: true,
              },
            },
            skills: {
              with: {
                skill: true,
              },
            },
          },
        },
      },
    });

    return applications;
  }

  /**
   * Get all applications for employer (across all jobs)
   */
  async getEmployerApplications(
    userId: string,
    filterDto: FilterApplicationsDto = {},
  ) {
    const employerProfile = await this.db.query.employerProfiles.findFirst({
      where: eq(employerProfiles.userId, userId),
    });

    if (!employerProfile) {
      throw new NotFoundException('Employer profile not found');
    }

    const { status, jobPostingId, limit = 20, offset = 0 } = filterDto;

    // Get all jobs for this employer
    const employerJobs = await this.db
      .select({ id: jobPostings.id })
      .from(jobPostings)
      .where(eq(jobPostings.employerProfileId, employerProfile.id));

    const jobIds = employerJobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return [];
    }

    const conditions:SQLWrapper[] = [];

    if (jobPostingId) {
      conditions.push(eq(jobApplications.jobPostingId, jobPostingId));
    } else {
      // Only show applications for employer's jobs
      conditions.push(
        sql`${jobApplications.jobPostingId} IN (${sql.join(jobIds.map((id) => sql`${id}`), sql`, `)})`,
      );
    }

    if (status) {
      conditions.push(eq(jobApplications.status, status as any));
    }

    const applications = await this.db.query.jobApplications.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset,
      orderBy: [desc(jobApplications.appliedAt)],
      with: {
        jobPosting: {
          columns: {
            jobTitle: true,
            employmentType: true,
            location: true,
          },
        },
        applicantProfile: {
          with: {
            user: {
              columns: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return applications;
  }

  /**
   * Update application status (employer only)
   */
  async updateStatus(
    id: string,
    userId: string,
    updateDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.findById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify ownership
    if (application.jobPosting.employerProfile.userId !== userId) {
      throw new ForbiddenException(
        'You can only update applications for your own jobs',
      );
    }

    return await this.db.transaction(async (tx) => {
      const oldStatus = application.status;

      // Update application
      const [updated] = await tx
        .update(jobApplications)
        .set({
          status: updateDto.status as any,
          updatedAt: new Date(),
        })
        .where(eq(jobApplications.id, id))
        .returning();

      // Create activity log
      await tx.insert(applicationActivities).values({
        applicationId: id,
        performedByUserId: userId,
        action: 'status_changed',
        oldStatus: oldStatus as any,
        newStatus: updateDto.status as any,
        notes: updateDto.notes || `Status changed from ${oldStatus} to ${updateDto.status}`,
      });

      return updated;
    });
  }

  /**
   * Add note to application (employer only)
   */
  async addNote(id: string, userId: string, addNoteDto: AddNoteDto) {
    const application = await this.findById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify ownership
    if (application.jobPosting.employerProfile.userId !== userId) {
      throw new ForbiddenException(
        'You can only add notes to applications for your own jobs',
      );
    }

    const [activity] = await this.db
      .insert(applicationActivities)
      .values({
        applicationId: id,
        performedByUserId: userId,
        action: 'note_added',
        notes: addNoteDto.notes,
      })
      .returning();

    return activity;
  }

  /**
   * Withdraw application (applicant only)
   */
  async withdraw(id: string, userId: string) {
    const application = await this.findById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify ownership
    if (application.applicantProfile.user.id !== userId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    // Can only withdraw if not already withdrawn or rejected
    if (['WITHDRAWN', 'REJECTED', 'ACCEPTED'].includes(application.status)) {
      throw new BadRequestException(
        `Cannot withdraw application with status: ${application.status}`,
      );
    }

    return await this.db.transaction(async (tx) => {
      // Update status
      const [updated] = await tx
        .update(jobApplications)
        .set({
          status: 'WITHDRAWN',
          updatedAt: new Date(),
        })
        .where(eq(jobApplications.id, id))
        .returning();

      // Create activity log
      await tx.insert(applicationActivities).values({
        applicationId: id,
        action: 'application_withdrawn',
        oldStatus: application.status as any,
        newStatus: 'WITHDRAWN',
        notes: 'Application withdrawn by applicant',
      });

      // Decrement application count
      await tx
        .update(jobPostings)
        .set({
          applicationCount: sql`${jobPostings.applicationCount} - 1`,
        })
        .where(eq(jobPostings.id, application.jobPostingId));

      return updated;
    });
  }

  /**
   * Get application activities/logs
   */
  async getActivities(id: string, userId: string) {
    const application = await this.findById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if user has access (applicant or employer)
    const isApplicant = application.applicantProfile.user.id === userId;
    const isEmployer = application.jobPosting.employerProfile.userId === userId;

    if (!isApplicant && !isEmployer) {
      throw new ForbiddenException('You do not have access to this application');
    }

    return application.activities;
  }

  /**
   * Get application statistics for applicant
   */
  async getApplicantStatistics(userId: string) {
    const applicantProfile = await this.db.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.userId, userId),
    });

    if (!applicantProfile) {
      throw new NotFoundException('Applicant profile not found');
    }

    const allApplications = await this.db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.applicantProfileId, applicantProfile.id));

    const totalApplications = allApplications.length;
    const submitted = allApplications.filter((a) => a.status === 'SUBMITTED').length;
    const reviewed = allApplications.filter((a) => a.status === 'REVIEWED').length;
    const shortlisted = allApplications.filter((a) => a.status === 'SHORTLISTED').length;
    const interviewed = allApplications.filter((a) => a.status === 'INTERVIEWED').length;
    const offered = allApplications.filter((a) => a.status === 'OFFERED').length;
    const accepted = allApplications.filter((a) => a.status === 'ACCEPTED').length;
    const rejected = allApplications.filter((a) => a.status === 'REJECTED').length;
    const withdrawn = allApplications.filter((a) => a.status === 'WITHDRAWN').length;

    return {
      totalApplications,
      submitted,
      reviewed,
      shortlisted,
      interviewed,
      offered,
      accepted,
      rejected,
      withdrawn,
    };
  }

  /**
   * Check if user has already applied to a job
   */
  async hasApplied(userId: string, jobId: string): Promise<boolean> {
    const applicantProfile = await this.db.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.userId, userId),
    });

    if (!applicantProfile) {
      return false;
    }

    const application = await this.db.query.jobApplications.findFirst({
      where: and(
        eq(jobApplications.jobPostingId, jobId),
        eq(jobApplications.applicantProfileId, applicantProfile.id),
      ),
    });

    return !!application;
  }
}