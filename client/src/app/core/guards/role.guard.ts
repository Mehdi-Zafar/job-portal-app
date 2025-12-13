import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const user = authService.getCurrentUser();
    const hasRole = requiredRoles.some((role) => user?.roles?.includes(role));

    if (hasRole) {
      return true;
    }

    // Redirect to unauthorized page or home
    router.navigate(['/unauthorized']);
    return false;
  };
};