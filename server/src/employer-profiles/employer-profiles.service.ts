// src/employer-profiles/employer-profiles.service.ts
import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION, type Database } from '../database/database.providers';
import { employerProfiles } from '../database/schema';
import { and, eq, ilike, or } from 'drizzle-orm';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { CompleteEmployerProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class EmployerProfilesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  /**
   * Create employer profile
   */
  async create(userId: string, createDto: CreateEmployerProfileDto) {
    const [profile] = await this.db
      .insert(employerProfiles)
      .values({
        userId,
        ...createDto,
      })
      .returning();

    return profile;
  }

  /**
   * Find profile by user ID
   */
  async findByUserId(userId: string) {
    const profile = await this.db.query.employerProfiles.findFirst({
      where: eq(employerProfiles.userId, userId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }

  /**
   * Find profile by ID
   */
  async findById(id: string) {
    const profile = await this.db.query.employerProfiles.findFirst({
      where: eq(employerProfiles.id, id),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
          },
        },
        jobPostings: {
          where: (jobPostings, { eq }) => eq(jobPostings.status, 'ACTIVE'),
          limit: 5,
          columns: {
            id: true,
            jobTitle: true,
            employmentType: true,
            location: true,
            postedDate: true,
          },
        },
      },
    });

    return profile;
  }

  /**
   * Update employer profile
   */
  async update(userId: string, updateDto: UpdateEmployerProfileDto) {
    const existingProfile = await this.findByUserId(userId);

    if (!existingProfile) {
      throw new NotFoundException('Employer profile not found');
    }

    const [updated] = await this.db
      .update(employerProfiles)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      })
      .where(eq(employerProfiles.userId, userId))
      .returning();

    // Recalculate completion percentage
    await this.updateCompletionPercentage(userId);

    return updated;
  }

  /**
   * Complete profile (wizard)
   */
  async completeProfile(userId: string, completeDto: CompleteEmployerProfileDto) {
    const [profile] = await this.db
      .update(employerProfiles)
      .set({
        companyName: completeDto.companyName,
        industry: completeDto.industry,
        companySize: completeDto.companySize,
        companyWebsite: completeDto.companyWebsite,
        companyDescription: completeDto.companyDescription,
        contactPersonName: completeDto.contactPersonName,
        contactPersonDesignation: completeDto.contactPersonDesignation,
        companyPhone: completeDto.companyPhone,
        companyAddress: completeDto.companyAddress,
        companyLogoUrl: completeDto.companyLogoUrl,
        isProfileComplete: true,
        completionPercentage: 100,
        updatedAt: new Date(),
      })
      .where(eq(employerProfiles.userId, userId))
      .returning();

    return profile;
  }

  /**
   * Update company logo
   */
  async updateLogo(userId: string, logoUrl: string) {
    const [updated] = await this.db
      .update(employerProfiles)
      .set({
        companyLogoUrl: logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(employerProfiles.userId, userId))
      .returning();

    await this.updateCompletionPercentage(userId);

    return updated;
  }

  /**
   * Verify employer profile (admin only)
   */
  async verifyProfile(id: string) {
    const [updated] = await this.db
      .update(employerProfiles)
      .set({
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(employerProfiles.id, id))
      .returning();

    return updated;
  }

  /**
   * Unverify employer profile (admin only)
   */
  async unverifyProfile(id: string) {
    const [updated] = await this.db
      .update(employerProfiles)
      .set({
        isVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(employerProfiles.id, id))
      .returning();

    return updated;
  }

  /**
   * Calculate and update completion percentage
   */
  async updateCompletionPercentage(userId: string) {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      return;
    }

    const requiredFields = [
      'companyName',
      'industry',
      'companySize',
      'companyDescription',
      'contactPersonName',
      'contactPersonDesignation',
      'companyPhone',
    ];

    const optionalFields = [
      'companyWebsite',
      'companyAddress',
      'companyLogoUrl',
    ];

    let filledRequired = 0;
    let filledOptional = 0;

    requiredFields.forEach((field) => {
      if (profile[field]) filledRequired++;
    });

    optionalFields.forEach((field) => {
      if (profile[field]) filledOptional++;
    });

    // Calculate percentage: required fields = 85%, optional = 15%
    const requiredPercentage = (filledRequired / requiredFields.length) * 85;
    const optionalPercentage = (filledOptional / optionalFields.length) * 15;

    const totalPercentage = Math.round(requiredPercentage + optionalPercentage);

    const isComplete = totalPercentage === 100;

    await this.db
      .update(employerProfiles)
      .set({
        completionPercentage: totalPercentage,
        isProfileComplete: isComplete,
      })
      .where(eq(employerProfiles.userId, userId));

    return totalPercentage;
  }

  /**
   * Get all verified employer profiles (public)
   */
  async findAllVerified(limit: number = 20, offset: number = 0) {
    const profiles = await this.db.query.employerProfiles.findMany({
      where: eq(employerProfiles.isVerified, true),
      limit,
      offset,
      with: {
        jobPostings: {
          where: (jobPostings, { eq }) => eq(jobPostings.status, 'ACTIVE'),
          limit: 3,
          columns: {
            id: true,
            jobTitle: true,
            location: true,
          },
        },
      },
    });

    return profiles;
  }

  /**
   * Search employer profiles
   */
  async search(query: string) {
  const profiles = await this.db
    .select()
    .from(employerProfiles)
    .where(
      and(
        eq(employerProfiles.isVerified, true),
        or(
          ilike(employerProfiles.companyName, `%${query}%`),
          ilike(employerProfiles.industry, `%${query}%`),
        ),
      ),
    )
    .limit(10);

  return profiles;
}

  /**
   * Delete profile (soft delete - just clear data)
   */
  async delete(userId: string) {
    await this.db
      .delete(employerProfiles)
      .where(eq(employerProfiles.userId, userId));

    return { message: 'Profile deleted successfully' };
  }
}