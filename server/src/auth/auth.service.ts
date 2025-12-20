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
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * Generate Access Token
   */
  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });
  }

  /**
   * Generate Refresh Token
   */
  private generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });
  }

  /**
   * Set Refresh Token Cookie
   */
  private setRefreshTokenCookie(response: Response, refreshToken: string): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/', // Cookie accessible from all paths
    });
  }

  /**
   * Clear Refresh Token Cookie
   */
  private clearRefreshTokenCookie(response: Response): void {
    response.cookie('refreshToken', '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
  }

  /**
   * Register new user
   */
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

    const validRoles = registerDto?.roles?.every(role => Object.values(Role).includes(role));
    if (!validRoles) {
      throw new BadRequestException('Invalid roles');
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

  /**
   * Login user
   */
  async login(loginDto: LoginDto, response: Response) {
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

    // Check if email is verified (uncomment in production)
    // if (!user.emailVerified) {
    //   throw new UnauthorizedException(
    //     'Please verify your email before signing in',
    //   );
    // }

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

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store hashed refresh token in database
    await this.usersService.updateRefreshToken(
      user.id,
      hashedRefreshToken,
      refreshTokenExpires,
    );

    // Set refresh token as HTTP-only cookie
    this.setRefreshTokenCookie(response, refreshToken);

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

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string, response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Find user
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify stored refresh token
      if (!user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      const newPayload = {
        sub: user.id,
        email: user.email,
        roles: await this.usersService.getUserRoles(user.id),
      };

      const newAccessToken = this.generateAccessToken(newPayload);
      const newRefreshToken = this.generateRefreshToken(newPayload);

      // Hash and store new refresh token
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.usersService.updateRefreshToken(
        user.id,
        hashedRefreshToken,
        refreshTokenExpires,
      );

      // Set new refresh token cookie
      this.setRefreshTokenCookie(response, newRefreshToken);

      return {
        accessToken: newAccessToken,
        user:{
          id: user.id,
          username: user.username,
          email: user.email,
          roles: await this.usersService.getUserRoles(user.id),
          emailVerified: user.emailVerified,
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, response: Response) {
    // Clear refresh token from database
    await this.usersService.clearRefreshToken(userId);

    // Clear refresh token cookie
    this.clearRefreshTokenCookie(response);

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Update user
    await this.usersService.verifyEmail(user.id);

    return {
      message: 'Email verified successfully. You can now sign in.',
    };
  }

  /**
   * Resend verification email
   */
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

  /**
   * Forgot password
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
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

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpires < new Date()) {
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