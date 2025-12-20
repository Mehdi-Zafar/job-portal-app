// src/employer-profiles/employer-profiles.controller.ts
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
  NotFoundException,
} from '@nestjs/common';
import { EmployerProfilesService } from './employer-profiles.service';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { CompleteEmployerProfileDto } from './dto/complete-profile.dto';
import { JwtAuthGuard } from '../auth/guards//jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('employer-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployerProfilesController {
  constructor(
    private readonly employerProfilesService: EmployerProfilesService,
  ) {}

  /**
   * Create employer profile (if not exists)
   */
  @Post()
  @Roles(Role.EMPLOYER)
  async create(
    @CurrentUser() currentUser: any,
    @Body() createDto: CreateEmployerProfileDto,
  ) {
    const existingProfile = await this.employerProfilesService.findByUserId(
      currentUser.userId,
    );

    if (existingProfile) {
      return {
        message: 'Profile already exists',
        profile: existingProfile,
      };
    }

    const profile = await this.employerProfilesService.create(
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
  @Roles(Role.EMPLOYER)
  async getMyProfile(@CurrentUser() currentUser: any) {
    const profile = await this.employerProfilesService.findByUserId(
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
  @Roles(Role.EMPLOYER)
  async updateMyProfile(
    @CurrentUser() currentUser: any,
    @Body() updateDto: UpdateEmployerProfileDto,
  ) {
    const profile = await this.employerProfilesService.update(
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
  @Roles(Role.EMPLOYER)
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @CurrentUser() currentUser: any,
    @Body() completeDto: CompleteEmployerProfileDto,
  ) {
    const profile = await this.employerProfilesService.completeProfile(
      currentUser.userId,
      completeDto,
    );

    return {
      message: 'Profile completed successfully',
      profile,
    };
  }

  /**
   * Update company logo
   */
  @Patch('me/logo')
  @Roles(Role.EMPLOYER)
  async updateLogo(
    @CurrentUser() currentUser: any,
    @Body('logoUrl') logoUrl: string,
  ) {
    const profile = await this.employerProfilesService.updateLogo(
      currentUser.userId,
      logoUrl,
    );

    return {
      message: 'Company logo updated successfully',
      profile,
    };
  }

  /**
   * Get all verified employer profiles (public)
   */
  @Get()
  @Public()
  async getAllVerified(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const profiles = await this.employerProfilesService.findAllVerified(
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );

    return {
      profiles,
      count: profiles.length,
    };
  }

  /**
   * Search employer profiles (public)
   */
  @Get('search')
  @Public()
  async search(@Query('q') query: string) {
    if (!query) {
      return {
        profiles: [],
        count: 0,
      };
    }

    const profiles = await this.employerProfilesService.search(query);

    return {
      profiles,
      count: profiles.length,
    };
  }

  /**
   * Get profile by ID (public)
   */
  @Get(':id')
  @Public()
  async getProfileById(@Param('id') id: string) {
    const profile = await this.employerProfilesService.findById(id);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Remove user ID for privacy
    const { userId, ...publicProfile } = profile;

    return {
      profile: publicProfile,
    };
  }

  /**
   * Verify employer profile (admin only)
   */
  @Patch(':id/verify')
  @Roles(Role.ADMIN)
  async verifyProfile(@Param('id') id: string) {
    const profile = await this.employerProfilesService.verifyProfile(id);

    return {
      message: 'Profile verified successfully',
      profile,
    };
  }

  /**
   * Unverify employer profile (admin only)
   */
  @Patch(':id/unverify')
  @Roles(Role.ADMIN)
  async unverifyProfile(@Param('id') id: string) {
    const profile = await this.employerProfilesService.unverifyProfile(id);

    return {
      message: 'Profile unverified successfully',
      profile,
    };
  }

  /**
   * Delete my profile
   */
  @Delete('me')
  @Roles(Role.EMPLOYER)
  @HttpCode(HttpStatus.OK)
  async deleteProfile(@CurrentUser() currentUser: any) {
    return this.employerProfilesService.delete(currentUser.userId);
  }
}
