// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash: hashedPassword,
      roles: registerDto.roles,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.usersService.findByEmailWithRoles(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in',
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Get user profiles
    const applicantProfile = user.roles.some((r) => r.role === 'APPLICANT')
      ? await this.usersService.getApplicantProfile(user.id)
      : null;

    const employerProfile = user.roles.some((r) => r.role === 'EMPLOYER')
      ? await this.usersService.getEmployerProfile(user.id)
      : null;

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map((r) => r.role),
        emailVerified: user.emailVerified,
        applicantProfile: applicantProfile
          ? {
              id: applicantProfile.id,
              isComplete: applicantProfile.isProfileComplete,
              completionPercentage: applicantProfile.completionPercentage,
            }
          : null,
        employerProfile: employerProfile
          ? {
              id: employerProfile.id,
              isComplete: employerProfile.isProfileComplete,
              completionPercentage: employerProfile.completionPercentage,
            }
          : null,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user?.emailVerificationExpires !== null && user?.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Update user
    await this.usersService.verifyEmail(user.id);

    return {
      message: 'Email verified successfully. You can now sign in.',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersService.updateVerificationToken(
      user.id,
      verificationToken,
      verificationExpires,
    );

    // Send email
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return {
      message: 'Verification email sent successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.usersService.updatePasswordResetToken(
      user.id,
      resetToken,
      resetExpires,
    );

    // Send email
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user?.passwordResetExpires !== null && user?.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: 'Password reset successfully. You can now sign in.',
    };
  }
}