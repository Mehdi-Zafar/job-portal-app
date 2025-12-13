// src/app/core/services/users.service.ts
import { Injectable, inject } from '@angular/core';
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

  /**
   * Get current user profile
   */
  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      tap((response) => {
        // Update current user in auth service
        this.authService['currentUserSubject'].next(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data: { username?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me`, data).pipe(
      tap(() => {
        // Refresh user profile after update
        this.getProfile().subscribe();
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
        // Refresh user profile after adding role
        this.getProfile().subscribe();
      })
    );
  }
}