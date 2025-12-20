// src/applicant-profiles/applicant-profiles.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApplicantProfilesService } from './applicant-profiles.service';
import { CreateApplicantProfileDto } from './dto/create-applicant-profile.dto';
import { UpdateApplicantProfileDto } from './dto/update-applicant-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('applicant-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicantProfilesController {
  constructor(
    private readonly applicantProfilesService: ApplicantProfilesService,
  ) {}

  /**
   * Create applicant profile (if not exists)
   */
  @Post()
  @Roles(Role.APPLICANT)
  async create(
    @CurrentUser() currentUser: any,
    @Body() createDto: CreateApplicantProfileDto,
  ) {
    const existingProfile = await this.applicantProfilesService.findByUserId(
      currentUser.userId,
    );

    if (existingProfile) {
      return {
        message: 'Profile already exists',
        profile: existingProfile,
      };
    }

    const profile = await this.applicantProfilesService.create(
      currentUser.userId,
      createDto,
    );

    return {
      message: 'Profile created successfully',
      profile,
    };
  }

  /**
   * Get my profile
   */
  @Get('me')
  @Roles(Role.APPLICANT)
  async getMyProfile(@CurrentUser() currentUser: any) {
    const profile = await this.applicantProfilesService.findByUserId(
      currentUser.userId,
    );

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      profile,
    };
  }

  /**
   * Update my profile
   */
  @Patch('me')
  @Roles(Role.APPLICANT)
  async updateMyProfile(
    @CurrentUser() currentUser: any,
    @Body() updateDto: UpdateApplicantProfileDto,
  ) {
    const profile = await this.applicantProfilesService.update(
      currentUser.userId,
      updateDto,
    );

    return {
      message: 'Profile updated successfully',
      profile,
    };
  }

  /**
   * Complete profile (wizard)
   */
  @Post('me/complete')
  @Roles(Role.APPLICANT)
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @CurrentUser() currentUser: any,
    @Body() completeDto: CompleteProfileDto,
  ) {
    const profile = await this.applicantProfilesService.completeProfile(
      currentUser.userId,
      completeDto,
    );

    return {
      message: 'Profile completed successfully',
      profile,
    };
  }

  /**
   * Add skill
   */
  @Post('me/skills')
  @Roles(Role.APPLICANT)
  async addSkill(
    @CurrentUser() currentUser: any,
    @Body() addSkillDto: AddSkillDto,
  ) {
    const skill = await this.applicantProfilesService.addSkill(
      currentUser.userId,
      addSkillDto,
    );

    return {
      message: 'Skill added successfully',
      skill,
    };
  }

  /**
   * Get my skills
   */
  @Get('me/skills')
  @Roles(Role.APPLICANT)
  async getMySkills(@CurrentUser() currentUser: any) {
    const skills = await this.applicantProfilesService.getSkills(
      currentUser.userId,
    );

    return {
      skills,
    };
  }

  /**
   * Remove skill
   */
  @Delete('me/skills/:skillId')
  @Roles(Role.APPLICANT)
  @HttpCode(HttpStatus.OK)
  async removeSkill(
    @CurrentUser() currentUser: any,
    @Param('skillId') skillId: string,
  ) {
    return this.applicantProfilesService.removeSkill(
      currentUser.userId,
      skillId,
    );
  }

  /**
   * Update resume
   */
  @Patch('me/resume')
  @Roles(Role.APPLICANT)
  async updateResume(
    @CurrentUser() currentUser: any,
    @Body('resumeUrl') resumeUrl: string,
  ) {
    const profile = await this.applicantProfilesService.updateResume(
      currentUser.userId,
      resumeUrl,
    );

    return {
      message: 'Resume updated successfully',
      profile,
    };
  }

  /**
   * Update profile image
   */
  @Patch('me/profile-image')
  @Roles(Role.APPLICANT)
  async updateProfileImage(
    @CurrentUser() currentUser: any,
    @Body('imageUrl') imageUrl: string,
  ) {
    const profile = await this.applicantProfilesService.updateProfileImage(
      currentUser.userId,
      imageUrl,
    );

    return {
      message: 'Profile image updated successfully',
      profile,
    };
  }

  /**
   * Get profile by ID (public - for employers)
   */
  @Get(':id')
  async getProfileById(@Param('id') id: string) {
    const profile = await this.applicantProfilesService.findById(id);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Remove sensitive information
    const { userId, ...publicProfile } = profile;

    return {
      profile: publicProfile,
    };
  }

  /**
   * Delete my profile
   */
  @Delete('me')
  @Roles(Role.APPLICANT)
  @HttpCode(HttpStatus.OK)
  async deleteProfile(@CurrentUser() currentUser: any) {
    return this.applicantProfilesService.delete(currentUser.userId);
  }
}
