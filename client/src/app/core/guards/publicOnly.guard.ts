import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PublicOnlyGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    // If user is logged in, redirect to dashboard/home and block access
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }
    // If not logged in, allow access to the login page
    return true;
  }
}
