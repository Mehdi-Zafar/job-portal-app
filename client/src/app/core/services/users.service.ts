// src/app/core/services/users.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/users`;

  // Loading state signal
  readonly loading = signal<boolean>(false);

  /**
   * Get current user profile
   */
  getProfile(): Observable<{ user: User }> {
    this.loading.set(true);

    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      tap((response) => {
        this.authService.updateCurrentUser(response.user);
        this.loading.set(false);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data: { username?: string }): Observable<any> {
    this.loading.set(true);

    return this.http.patch(`${this.apiUrl}/me`, data).pipe(
      tap(() => {
        this.getProfile().subscribe();
        this.loading.set(false);
      })
    );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/password`, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Deactivate account
   */
  deactivateAccount(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/deactivate`, {});
  }

  /**
   * Delete account
   */
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/me`).pipe(
      tap(() => {
        this.authService.logout();
      })
    );
  }

  /**
   * Get user roles
   */
  getRoles(): Observable<{ roles: string[] }> {
    return this.http.get<{ roles: string[] }>(`${this.apiUrl}/me/roles`);
  }

  /**
   * Add role to user
   */
  addRole(role: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/roles`, { role }).pipe(
      tap(() => {
        this.getProfile().subscribe();
      })
    );
  }
}