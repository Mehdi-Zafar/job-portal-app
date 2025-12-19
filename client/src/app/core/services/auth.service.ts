// src/app/core/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginResponse, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals
  private currentUserSignal = signal<User | null>(null);
  private accessTokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private initializingSignal = signal<boolean>(false);

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly initializing = this.initializingSignal.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => {
    const user = this.currentUser();
    const token = this.accessTokenSignal();
    return !!user && !!token;
  });

  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly isApplicant = computed(() => this.userRoles().includes('APPLICANT'));
  readonly isEmployer = computed(() => this.userRoles().includes('EMPLOYER'));
  readonly isAdmin = computed(() => this.userRoles().includes('ADMIN'));

  readonly applicantProfile = computed(() => this.currentUser()?.applicantProfile);
  readonly employerProfile = computed(() => this.currentUser()?.employerProfile);
  readonly isApplicantProfileComplete = computed(
    () => this.applicantProfile()?.isComplete ?? false
  );
  readonly isEmployerProfileComplete = computed(() => this.employerProfile()?.isComplete ?? false);

  private refreshTokenTimeout?: any;

  constructor() {
    // Memory-only approach - no localStorage
  }

  /**
   * Initialize auth state from refresh token cookie
   * Called by provideAppInitializer
   */
  initializeFromRefreshToken(): Observable<void> {
    this.initializingSignal.set(true);

    return this.http
      .post<{ accessToken: string; user: User }>(
        `${this.apiUrl}/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          debugger;
          this.accessTokenSignal.set(response.accessToken);
          this.currentUserSignal.set(response.user);
          this.startRefreshTokenTimer();
          console.log('✅ Auth initialized from refresh token');
        }),
        catchError((error) => {
          console.log('❌ No valid refresh token found');
          // Return empty observable to continue app initialization
          return of(undefined);
        }),
        map(() => undefined), // Convert to Observable<void>
        tap(() => {
          this.initializingSignal.set(false);
        })
      );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<LoginResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.accessTokenSignal.set(response.accessToken);
          this.currentUserSignal.set(response.user);
          this.startRefreshTokenTimer();
          this.loadingSignal.set(false);
        }),
        catchError((error) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(error.error?.message || 'Login failed');
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.accessTokenSignal.set(response.accessToken);
          this.startRefreshTokenTimer();
        }),
        catchError((error) => {
          // If refresh fails, logout
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout
   */
  logout(): void {
    this.loadingSignal.set(true);

    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => {
        this.stopRefreshTokenTimer();
        this.accessTokenSignal.set(null);
        this.currentUserSignal.set(null);
        this.loadingSignal.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Force logout even if API call fails
        this.stopRefreshTokenTimer();
        this.accessTokenSignal.set(null);
        this.currentUserSignal.set(null);
        this.loadingSignal.set(false);
        this.router.navigate(['/auth/login']);
      },
    });
  }

  /**
   * Register user
   */
  register(data: RegisterRequest): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.error?.message || 'Registration failed');
        return throwError(() => error);
      })
    );
  }

  /**
   * Verify email
   */
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email/${token}`);
  }

  /**
   * Resend verification email
   */
  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  /**
   * Get JWT token (from memory)
   */
  getToken(): string | null {
    return this.accessTokenSignal();
  }

  /**
   * Update current user (called after profile updates)
   */
  updateCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  /**
   * Start refresh token timer
   */
  private startRefreshTokenTimer(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const jwtToken = JSON.parse(atob(token.split('.')[1]));
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - 60 * 1000;

      if (timeout > 0) {
        this.refreshTokenTimeout = setTimeout(() => {
          console.log('🔄 Auto-refreshing token...');
          this.refreshToken().subscribe({
            next: () => console.log('✅ Token refreshed successfully'),
            error: (err) => console.error('❌ Token refresh failed:', err),
          });
        }, timeout);
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }

  /**
   * Stop refresh token timer
   */
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
}
