// src/app/core/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, map, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginResponse, RegisterRequest, Role } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals
  private currentUserSignal = signal<User | null>(null);
  private accessTokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private initializingSignal = signal<boolean>(false);
  private isRefreshingSignal = signal<boolean>(false); // Track if refresh is in progress

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly initializing = this.initializingSignal.asReadonly();
  readonly isRefreshing = this.isRefreshingSignal.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => {
    const user = this.currentUser();
    const token = this.accessTokenSignal();
    return !!user && !!token;
  });

  readonly isEmailVerified = computed(() => {
    return this.currentUser()?.emailVerified ?? false;
  });

  readonly needsEmailVerification = computed(() => {
    return this.isAuthenticated() && !this.isEmailVerified();
  });

  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly isApplicant = computed(() => this.userRoles().includes(Role.APPLICANT));
  readonly isEmployer = computed(() => this.userRoles().includes(Role.EMPLOYER));
  readonly isAdmin = computed(() => this.userRoles().includes(Role.ADMIN));

  readonly applicantProfile = computed(() => this.currentUser()?.applicantProfile);
  readonly employerProfile = computed(() => this.currentUser()?.employerProfile);
  readonly isApplicantProfileComplete = computed(
    () => this.applicantProfile()?.isComplete ?? false
  );
  readonly isEmployerProfileComplete = computed(
    () => this.employerProfile()?.isComplete ?? false
  );

  /**
   * Initialize auth state from refresh token cookie
   * Called by APP_INITIALIZER
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
          this.accessTokenSignal.set(response.accessToken);
          this.currentUserSignal.set(response.user);
          console.log('✅ Auth initialized from refresh token');
        }),
        catchError((error) => {
          console.log('❌ No valid refresh token found');
          this.accessTokenSignal.set(null);
          this.currentUserSignal.set(null);
          return of(undefined);
        }),
        map(() => undefined),
        finalize(() => {
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
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this.accessTokenSignal.set(response.accessToken);
          this.currentUserSignal.set(response.user);
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
   * Returns Observable<string> with the new access token
   */
  refreshToken(): Observable<string> {
    // If already refreshing, wait for the current refresh to complete
    if (this.isRefreshingSignal()) {
      console.log('⏳ Refresh already in progress, waiting...');
    }

    this.isRefreshingSignal.set(true);

    return this.http
      .post<{ accessToken: string; user?: User }>(
        `${this.apiUrl}/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this.accessTokenSignal.set(response.accessToken);
          if (response.user) {
            this.currentUserSignal.set(response.user);
          }
          console.log('✅ Token refreshed successfully');
        }),
        map((response) => response.accessToken),
        catchError((error) => {
          console.error('❌ Token refresh failed:', error.status);
          // Clear auth state and redirect to login
          this.clearAuthState();
          this.router.navigate(['/sign-in']);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshingSignal.set(false);
        })
      );
  }

  /**
   * Logout
   */
  logout(): void {
    this.loadingSignal.set(true);

    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.clearAuthState();
          this.toastr.success('Logged out successfully!', 'Success');
          this.router.navigate(['/sign-in']);
        },
        error: (err) => {
          // Force logout even if API call fails
          this.clearAuthState();
          this.toastr.error(err.error.message, 'Error');
          this.router.navigate(['/sign-in']);
        },
      });
  }

  /**
   * Clear all auth state
   */
  private clearAuthState(): void {
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.loadingSignal.set(false);
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
  hasRole(role: Role): boolean {
    return this.userRoles().includes(role);
  }
}