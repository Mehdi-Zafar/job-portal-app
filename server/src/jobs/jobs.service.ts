// src/jobs/jobs.service.ts
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DATABASE_CONNECTION, type Database } from '../database/database.providers';
import {
  jobPostings,
  jobRequiredSkills,
  skills,
  employerProfiles,
} from '../database/schema';
import { eq, and, or, ilike, gte, lte, inArray, desc, sql, SQLWrapper } from 'drizzle-orm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { ApplicationMethod, EducationLevel, EmploymentType, ExperienceLevel, JobStatus, SalaryType, TravelRequirement, WorkplaceType } from 'src/common/enums';

@Injectable()
export class JobsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  /**
   * Create job posting
   */
  async create(userId: string, createDto: CreateJobDto) {
    // Get employer profile
    const employerProfile = await this.db.query.employerProfiles.findFirst({
      where: eq(employerProfiles.userId, userId),
    });

    if (!employerProfile) {
      throw new NotFoundException('Employer profile not found');
    }

    if (!employerProfile.isProfileComplete) {
      throw new ForbiddenException(
        'Please complete your employer profile before posting jobs',
      );
    }

    return await this.db.transaction(async (tx) => {
      // Create job posting
      const [job] = await tx
        .insert(jobPostings)
        .values({
          employerProfileId: employerProfile.id,
          jobTitle: createDto.jobTitle,
          employmentType: createDto.employmentType as any,
          workplaceType: createDto.workplaceType as any,
          location: createDto.location,
          department: createDto.department,
          numberOfOpenings: createDto.numberOfOpenings,
          jobSummary: createDto.jobSummary,
          jobDescription: createDto.jobDescription,
          responsibilities: createDto.responsibilities,
          requirements: createDto.requirements,
          educationLevel: createDto.educationLevel as any,
          experienceLevel: createDto.experienceLevel,
          yearsOfExperience: createDto.yearsOfExperience,
          showSalary: createDto.showSalary,
          salaryType: createDto.salaryType as any,
          salaryMin: createDto.salaryMin,
          salaryMax: createDto.salaryMax,
          currency: createDto.currency || 'USD',
          benefits: createDto.benefits || [],
          hasEquity: createDto.hasEquity,
          applicationDeadline: createDto.applicationDeadline,
          applicationMethod: createDto.applicationMethod as any,
          externalUrl: createDto.externalUrl,
          screeningQuestions: createDto.screeningQuestions || [],
          visaSponsorship: createDto.visaSponsorship,
          travelRequirement: createDto.travelRequirement as any,
          status: (createDto.status as any) || 'DRAFT',
          postedDate: createDto.status === 'ACTIVE' ? new Date() : null,
        })
        .returning();

      // Add required skills
      if (createDto.skills && createDto.skills.length > 0) {
        for (const skillReq of createDto.skills) {
          // Find or create skill
          let skillRecord = await tx.query.skills.findFirst({
            where: eq(skills.name, skillReq.skillName),
          });

          if (!skillRecord) {
            [skillRecord] = await tx
              .insert(skills)
              .values({
                name: skillReq.skillName,
                category: 'General',
              })
              .returning();
          }

          // Add skill requirement to job
          await tx.insert(jobRequiredSkills).values({
            jobPostingId: job.id,
            skillId: skillRecord.id,
            isRequired: skillReq.isRequired,
          });
        }
      }

      return job;
    });
  }

  /**
   * Find all jobs (with filters)
   */
  async findAll(searchDto: SearchJobsDto = {}) {
    const {
      query,
      location,
      employmentType,
      workplaceType,
      department,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills: skillsQuery,
      limit = 20,
      offset = 0,
    } = searchDto;

    // Build where conditions
    const conditions = [];

    // Only show active jobs for public
    conditions.push(eq(jobPostings.status, 'ACTIVE'));

    // Search query (job title or description)
    if (query) {
      conditions.push(
        or(
          ilike(jobPostings.jobTitle, `%${query}%`),
          ilike(jobPostings.jobDescription, `%${query}%`),
        ),
      );
    }

    // Location filter
    if (location) {
      conditions.push(ilike(jobPostings.location, `%${location}%`));
    }

    // Employment type filter
    if (employmentType) {
      conditions.push(eq(jobPostings.employmentType, employmentType as any));
    }

    // Workplace type filter
    if (workplaceType) {
      conditions.push(eq(jobPostings.workplaceType, workplaceType as any));
    }

    // Department filter
    if (department) {
      conditions.push(eq(jobPostings.department, department));
    }

    // Experience level filter
    if (experienceLevel) {
      conditions.push(eq(jobPostings.experienceLevel, experienceLevel));
    }

    // Salary filters
    if (salaryMin) {
      conditions.push(gte(jobPostings.salaryMin, salaryMin));
    }

    if (salaryMax) {
      conditions.push(lte(jobPostings.salaryMax, salaryMax));
    }

    // Execute query
    const jobs = await this.db.query.jobPostings.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset,
      orderBy: [desc(jobPostings.postedDate)],
      with: {
        employerProfile: {
          columns: {
            id: true,
            companyName: true,
            companyLogoUrl: true,
            industry: true,
            isVerified: true,
          },
        },
        requiredSkills: {
          with: {
            skill: true,
          },
        },
      },
    });

    // If skills filter is provided, filter jobs by skills
    if (skillsQuery) {
      const skillNames = skillsQuery.split(',').map((s) => s.trim());
      const filteredJobs = jobs.filter((job) => {
        const jobSkills = job.requiredSkills.map((rs) => rs.skill.name);
        return skillNames.some((skillName) =>
          jobSkills.some((js) =>
            js.toLowerCase().includes(skillName.toLowerCase()),
          ),
        );
      });
      return filteredJobs;
    }

    return jobs;
  }

  /**
   * Find job by ID (with full details)
   */
  async findById(id: string) {
    const job = await this.db.query.jobPostings.findFirst({
      where: eq(jobPostings.id, id),
      with: {
        employerProfile: {
          with: {
            user: {
              columns: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        requiredSkills: {
          with: {
            skill: true,
          },
        },
      },
    });

    if (!job) {
      return null;
    }

    // Increment view count
    await this.incrementViewCount(id);

    return job;
  }

  /**
   * Get jobs by employer
   */
  async findByEmployer(userId: string) {
    const employerProfile = await this.db.query.employerProfiles.findFirst({
      where: eq(employerProfiles.userId, userId),
    });

    if (!employerProfile) {
      throw new NotFoundException('Employer profile not found');
    }

    const jobs = await this.db.query.jobPostings.findMany({
      where: eq(jobPostings.employerProfileId, employerProfile.id),
      orderBy: [desc(jobPostings.createdAt)],
      with: {
        requiredSkills: {
          with: {
            skill: true,
          },
        },
      },
    });

    return jobs;
  }

  /**
   * Update job
   */
  async update(id: string, userId: string, updateDto: UpdateJobDto) {
    const job = await this.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check ownership
    if (job.employerProfile.userId !== userId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    return await this.db.transaction(async (tx) => {
      // Update job
      const [updated] = await tx
        .update(jobPostings)
        .set({
          ...updateDto,
          salaryMin: updateDto.salaryMin,
          salaryMax: updateDto.salaryMax,
          updatedAt: new Date(),
        })
        .where(eq(jobPostings.id, id))
        .returning();

      // Update skills if provided
      if (updateDto.skills) {
        // Delete existing skills
        await tx
          .delete(jobRequiredSkills)
          .where(eq(jobRequiredSkills.jobPostingId, id));

        // Add new skills
        for (const skillReq of updateDto.skills) {
          let skillRecord = await tx.query.skills.findFirst({
            where: eq(skills.name, skillReq.skillName),
          });

          if (!skillRecord) {
            [skillRecord] = await tx
              .insert(skills)
              .values({
                name: skillReq.skillName,
                category: 'General',
              })
              .returning();
          }

          await tx.insert(jobRequiredSkills).values({
            jobPostingId: id,
            skillId: skillRecord.id,
            isRequired: skillReq.isRequired,
          });
        }
      }

      return updated;
    });
  }

  /**
   * Update job status
   */
  async updateStatus(id: string, userId: string, status: string) {
    const job = await this.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check ownership
    if (job.employerProfile.userId !== userId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };

    // Set posted date when activating
    if (status === 'ACTIVE' && !job.postedDate) {
      updateData.postedDate = new Date();
    }

    // Set closed date when closing
    if (status === 'CLOSED' && !job.closedDate) {
      updateData.closedDate = new Date();
    }

    const [updated] = await this.db
      .update(jobPostings)
      .set(updateData)
      .where(eq(jobPostings.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete job
   */
  async delete(id: string, userId: string) {
    const job = await this.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check ownership
    if (job.employerProfile.userId !== userId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    await this.db.delete(jobPostings).where(eq(jobPostings.id, id));

    return { message: 'Job deleted successfully' };
  }

  /**
   * Duplicate job
   */
  async duplicate(id: string, userId: string) {
    const job = await this.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check ownership
    if (job.employerProfile.userId !== userId) {
      throw new ForbiddenException('You can only duplicate your own jobs');
    }

    // Remove fields that shouldn't be duplicated
    const { id: _, postedDate, closedDate, createdAt, updatedAt, viewCount, applicationCount, ...jobData } = job;

    // Create new job as draft
    const createDto: CreateJobDto = {
      ...jobData,
      jobTitle: `${jobData.jobTitle} (Copy)`,
      status: JobStatus.DRAFT,
      employmentType: jobData.employmentType as EmploymentType,
      workplaceType: jobData.workplaceType as WorkplaceType,
      educationLevel: jobData.educationLevel as EducationLevel,
      experienceLevel: jobData.experienceLevel as ExperienceLevel,
      salaryType: jobData.salaryType as SalaryType,
      applicationMethod: jobData.applicationMethod as ApplicationMethod,
      travelRequirement: jobData.travelRequirement as TravelRequirement,
      skills: job.requiredSkills.map((rs) => ({
        skillName: rs.skill.name,
        isRequired: rs.isRequired,
      })),
    };

    return this.create(userId, createDto);
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string) {
    await this.db
      .update(jobPostings)
      .set({
        viewCount: sql`${jobPostings.viewCount} + 1`,
      })
      .where(eq(jobPostings.id, id));
  }

  /**
   * Get job statistics for employer
   */
  async getEmployerStatistics(userId: string) {
    const employerProfile = await this.db.query.employerProfiles.findFirst({
      where: eq(employerProfiles.userId, userId),
    });

    if (!employerProfile) {
      throw new NotFoundException('Employer profile not found');
    }

    const allJobs = await this.db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.employerProfileId, employerProfile.id));

    const totalJobs = allJobs.length;
    const activeJobs = allJobs.filter((j) => j.status === 'ACTIVE').length;
    const draftJobs = allJobs.filter((j) => j.status === 'DRAFT').length;
    const closedJobs = allJobs.filter((j) => j.status === 'CLOSED').length;
    const totalViews = allJobs.reduce((sum, j) => sum + (j.viewCount || 0), 0);
    const totalApplications = allJobs.reduce(
      (sum, j) => sum + (j.applicationCount || 0),
      0,
    );

    return {
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      totalViews,
      totalApplications,
    };
  }

  /**
   * Search jobs (advanced)
   */
  async search(searchDto: SearchJobsDto) {
    return this.findAll(searchDto);
  }

  /**
   * Get similar jobs
   */
  async getSimilarJobs(id: string, limit: number = 5) {
    const job = await this.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Find jobs with similar department or skills
    const similarJobs = await this.db.query.jobPostings.findMany({
      where: and(
        eq(jobPostings.status, 'ACTIVE'),
        or(
          eq(jobPostings.department, job.department),
          eq(jobPostings.experienceLevel, job.experienceLevel),
        ),
      ),
      limit: limit + 1, // Get one extra to exclude current job
      with: {
        employerProfile: {
          columns: {
            companyName: true,
            companyLogoUrl: true,
          },
        },
      },
    });

    // Exclude current job
    return similarJobs.filter((j) => j.id !== id).slice(0, limit);
  }
}