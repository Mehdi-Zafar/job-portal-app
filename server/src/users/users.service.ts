// src/users/users.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type Database, DATABASE_CONNECTION } from '../database/database.providers';
import { users, userRoles, applicantProfiles, employerProfiles } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by email with roles
   */
  async findByEmailWithRoles(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        roles: true,
      },
    });

    return user || null;
  }

  /**
   * Find user by ID with full details (roles and profiles)
   */
  async findByIdWithDetails(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        roles: true,
        applicantProfile: true,
        employerProfile: true,
      },
    });

    return user || null;
  }

  /**
   * Find user by verification token
   */
  async findByVerificationToken(token: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create new user with roles
   */
  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
    roles: string[];
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
  }) {
    return await this.db.transaction(async (tx) => {
      // Insert user
      const [user] = await tx
        .insert(users)
        .values({
          username: data.username,
          email: data.email,
          passwordHash: data.passwordHash,
          emailVerificationToken: data.emailVerificationToken,
          emailVerificationExpires: data.emailVerificationExpires,
        })
        .returning();

      // Insert roles
      const roleValues = data.roles.map((role) => ({
        userId: user.id,
        role: role as any,
      }));

      await tx.insert(userRoles).values(roleValues);

      // Create profiles based on roles
      if (data.roles.includes('APPLICANT')) {
        await tx.insert(applicantProfiles).values({
          userId: user.id,
          fullName: data.username, // Temporary, user will update later
        });
      }

      if (data.roles.includes('EMPLOYER')) {
        await tx.insert(employerProfiles).values({
          userId: user.id,
          companyName: '', // User will complete later
        });
      }

      return user;
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDto) {
    const [updated] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Verify email
   */
  async verifyEmail(id: string) {
    const [updated] = await this.db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Update verification token
   */
  async updateVerificationToken(
    id: string,
    token: string,
    expires: Date,
  ) {
    const [updated] = await this.db
      .update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Update password reset token
   */
  async updatePasswordResetToken(
    id: string,
    token: string,
    expires: Date,
  ) {
    const [updated] = await this.db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Update password
   */
  async updatePassword(id: string, passwordHash: string) {
    const [updated] = await this.db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    await this.db.delete(users).where(eq(users.id, id));
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string) {
    const [updated] = await this.db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Activate user account
   */
  async activate(id: string) {
    const [updated] = await this.db
      .update(users)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Get applicant profile for user
   */
  async getApplicantProfile(userId: string) {
    const result = await this.db
      .select()
      .from(applicantProfiles)
      .where(eq(applicantProfiles.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get employer profile for user
   */
  async getEmployerProfile(userId: string) {
    const result = await this.db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.role, role as any),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string) {
    const roles = await this.db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    return roles.map((r) => r.role);
  }

  /**
   * Add role to user
   */
  async addRole(userId: string, role: string) {
    const [newRole] = await this.db
      .insert(userRoles)
      .values({
        userId,
        role: role as any,
      })
      .returning();

    // Create profile if needed
    if (role === 'APPLICANT') {
      const existingProfile = await this.getApplicantProfile(userId);
      if (!existingProfile) {
        const user = await this.findById(userId);
        await this.db.insert(applicantProfiles).values({
          userId,
          fullName: user?.username || '',
        });
      }
    }

    if (role === 'EMPLOYER') {
      const existingProfile = await this.getEmployerProfile(userId);
      if (!existingProfile) {
        await this.db.insert(employerProfiles).values({
          userId,
          companyName: '',
        });
      }
    }

    return newRole;
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, role: string) {
    await this.db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.role, role as any),
        ),
      );
  }
}