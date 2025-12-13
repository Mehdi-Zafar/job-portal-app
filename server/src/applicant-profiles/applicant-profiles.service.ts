// src/applicant-profiles/applicant-profiles.service.ts
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DATABASE_CONNECTION, type Database } from '../database/database.providers';
import {
  applicantProfiles,
  applicantSkills,
  skills,
} from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { CreateApplicantProfileDto } from './dto/create-applicant-profile.dto';
import { UpdateApplicantProfileDto } from './dto/update-applicant-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';

@Injectable()
export class ApplicantProfilesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  /**
   * Create applicant profile
   */
  async create(userId: string, createDto: CreateApplicantProfileDto) {
    const [profile] = await this.db
      .insert(applicantProfiles)
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
    const profile = await this.db.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.userId, userId),
      with: {
        skills: {
          with: {
            skill: true,
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
    const profile = await this.db.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.id, id),
      with: {
        skills: {
          with: {
            skill: true,
          },
        },
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
   * Update applicant profile
   */
  async update(userId: string, updateDto: UpdateApplicantProfileDto) {
    const existingProfile = await this.findByUserId(userId);

    if (!existingProfile) {
      throw new NotFoundException('Applicant profile not found');
    }

    const [updated] = await this.db
      .update(applicantProfiles)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      })
      .where(eq(applicantProfiles.userId, userId))
      .returning();

    // Recalculate completion percentage
    await this.updateCompletionPercentage(userId);

    return updated;
  }

  /**
   * Complete profile (wizard)
   */
  async completeProfile(userId: string, completeDto: CompleteProfileDto) {
    return await this.db.transaction(async (tx) => {
      // Update profile
      const [profile] = await tx
        .update(applicantProfiles)
        .set({
          fullName: completeDto.fullName,
          phone: completeDto.phone,
          dateOfBirth: completeDto.dateOfBirth,
          currentLocation: completeDto.currentLocation,
          gender: completeDto.gender as any,
          currentTitle: completeDto.currentTitle,
          yearsOfExperience: completeDto.yearsOfExperience,
          professionalSummary: completeDto.professionalSummary,
          experienceLevel: completeDto.experienceLevel as any,
          willingToRelocate: completeDto.willingToRelocate,
          expectedSalaryMin: completeDto.expectedSalaryMin,
          expectedSalaryMax: completeDto.expectedSalaryMax,
          resumeUrl: completeDto.resumeUrl,
          isProfileComplete: true,
          completionPercentage: 100,
          updatedAt: new Date(),
        })
        .where(eq(applicantProfiles.userId, userId))
        .returning();

      // Add skills
      if (completeDto.skills && completeDto.skills.length > 0) {
        for (const skillDto of completeDto.skills) {
          // Find or create skill
          let skillRecord = await tx.query.skills.findFirst({
            where: eq(skills.name, skillDto.name),
          });

          if (!skillRecord) {
            [skillRecord] = await tx
              .insert(skills)
              .values({
                name: skillDto.name,
                category: 'General', // Default category
              })
              .returning();
          }

          // Add skill to applicant
          await tx.insert(applicantSkills).values({
            applicantProfileId: profile.id,
            skillId: skillRecord.id,
            proficiencyLevel: skillDto.proficiencyLevel as any,
            yearsOfExperience: skillDto.yearsOfExperience,
          });
        }
      }

      return profile;
    });
  }

  /**
   * Add skill to applicant
   */
  async addSkill(userId: string, addSkillDto: AddSkillDto) {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Applicant profile not found');
    }

    return await this.db.transaction(async (tx) => {
      // Find or create skill
      let skillRecord = await tx.query.skills.findFirst({
        where: eq(skills.name, addSkillDto.skillName),
      });

      if (!skillRecord) {
        [skillRecord] = await tx
          .insert(skills)
          .values({
            name: addSkillDto.skillName,
            category: 'General',
          })
          .returning();
      }

      // Check if skill already exists for this applicant
      const existingSkill = await tx.query.applicantSkills.findFirst({
        where: and(
          eq(applicantSkills.applicantProfileId, profile.id),
          eq(applicantSkills.skillId, skillRecord.id),
        ),
      });

      if (existingSkill) {
        throw new BadRequestException('Skill already added');
      }

      // Add skill
      const [newSkill] = await tx
        .insert(applicantSkills)
        .values({
          applicantProfileId: profile.id,
          skillId: skillRecord.id,
          proficiencyLevel: addSkillDto.proficiencyLevel as any,
          yearsOfExperience: addSkillDto.yearsOfExperience,
        })
        .returning();

      return newSkill;
    });
  }

  /**
   * Remove skill from applicant
   */
  async removeSkill(userId: string, skillId: string) {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Applicant profile not found');
    }

    await this.db
      .delete(applicantSkills)
      .where(
        and(
          eq(applicantSkills.applicantProfileId, profile.id),
          eq(applicantSkills.skillId, skillId),
        ),
      );

    return { message: 'Skill removed successfully' };
  }

  /**
   * Update resume URL
   */
  async updateResume(userId: string, resumeUrl: string) {
    const [updated] = await this.db
      .update(applicantProfiles)
      .set({
        resumeUrl,
        updatedAt: new Date(),
      })
      .where(eq(applicantProfiles.userId, userId))
      .returning();

    await this.updateCompletionPercentage(userId);

    return updated;
  }

  /**
   * Update profile image
   */
  async updateProfileImage(userId: string, imageUrl: string) {
    const [updated] = await this.db
      .update(applicantProfiles)
      .set({
        profileImageUrl: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(applicantProfiles.userId, userId))
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
      'fullName',
      'phone',
      'currentLocation',
      'currentTitle',
      'professionalSummary',
      'yearsOfExperience',
      'resumeUrl',
    ];

    const optionalFields = [
      'dateOfBirth',
      'gender',
      'experienceLevel',
      'expectedSalaryMin',
      'profileImageUrl',
    ];

    let filledRequired = 0;
    let filledOptional = 0;

    requiredFields.forEach((field) => {
      if (profile[field]) filledRequired++;
    });

    optionalFields.forEach((field) => {
      if (profile[field]) filledOptional++;
    });

    // Calculate percentage: required fields = 70%, optional = 20%, skills = 10%
    const requiredPercentage = (filledRequired / requiredFields.length) * 70;
    const optionalPercentage = (filledOptional / optionalFields.length) * 20;
    const skillsPercentage = profile.skills && profile.skills.length > 0 ? 10 : 0;

    const totalPercentage = Math.round(
      requiredPercentage + optionalPercentage + skillsPercentage,
    );

    const isComplete = totalPercentage === 100;

    await this.db
      .update(applicantProfiles)
      .set({
        completionPercentage: totalPercentage,
        isProfileComplete: isComplete,
      })
      .where(eq(applicantProfiles.userId, userId));

    return totalPercentage;
  }

  /**
   * Get applicant's skills
   */
  async getSkills(userId: string) {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Applicant profile not found');
    }

    return profile.skills || [];
  }

  /**
   * Delete profile (soft delete - just clear data)
   */
  async delete(userId: string) {
    await this.db
      .delete(applicantProfiles)
      .where(eq(applicantProfiles.userId, userId));

    return { message: 'Profile deleted successfully' };
  }
}