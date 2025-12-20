// src/common/guards/email-verified.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route allows unverified users
    const allowUnverified = this.reflector.getAllAndOverride<boolean>('allowUnverified', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (allowUnverified) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.emailVerified) {
      throw new ForbiddenException({
        message: 'Email verification required',
        emailVerified: false,
      });
    }

    return true;
  }
}