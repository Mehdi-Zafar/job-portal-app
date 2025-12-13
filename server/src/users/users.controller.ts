// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   */
  @Get('me')
  async getProfile(@CurrentUser() currentUser: any) {
    const user = await this.usersService.findByIdWithDetails(currentUser.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { passwordHash, emailVerificationToken, passwordResetToken, ...userWithoutSensitive } = user;

    return {
      user: {
        ...userWithoutSensitive,
        roles: user.roles.map((r) => r.role),
      },
    };
  }

  /**
   * Update current user
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser() currentUser: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Check if username is taken
    if (updateUserDto.username) {
      const existingUser = await this.usersService.findByUsername(
        updateUserDto.username,
      );
      if (existingUser && existingUser.id !== currentUser.userId) {
        throw new BadRequestException('Username already taken');
      }
    }

    const updatedUser = await this.usersService.update(
      currentUser.userId,
      updateUserDto,
    );

    const { passwordHash, emailVerificationToken, passwordResetToken, ...userWithoutSensitive } = updatedUser;

    return {
      message: 'Profile updated successfully',
      user: userWithoutSensitive,
    };
  }

  /**
   * Change password
   */
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() currentUser: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.usersService.findById(currentUser.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Deactivate account
   */
  @Patch('me/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(@CurrentUser() currentUser: any) {
    await this.usersService.deactivate(currentUser.userId);

    return {
      message: 'Account deactivated successfully',
    };
  }

  /**
   * Delete account
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser() currentUser: any) {
    await this.usersService.delete(currentUser.userId);

    return {
      message: 'Account deleted successfully',
    };
  }

  /**
   * Get user roles
   */
  @Get('me/roles')
  async getRoles(@CurrentUser() currentUser: any) {
    const roles = await this.usersService.getUserRoles(currentUser.userId);

    return {
      roles,
    };
  }

  /**
   * Add role to current user
   */
  @Patch('me/roles')
  async addRole(
    @CurrentUser() currentUser: any,
    @Body('role') role: string,
  ) {
    const validRoles = ['APPLICANT', 'EMPLOYER'];
    
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const hasRole = await this.usersService.hasRole(currentUser.userId, role);
    
    if (hasRole) {
      throw new BadRequestException('User already has this role');
    }

    await this.usersService.addRole(currentUser.userId, role);

    return {
      message: `${role} role added successfully`,
    };
  }
}