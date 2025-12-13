// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user from localStorage on init
    this.loadUserFromStorage();
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password,
    }).pipe(
      tap((response) => {
        this.setToken(response.accessToken);
        this.currentUserSubject.next(response.user);
        this.saveUserToStorage(response.user);
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
   * Logout
   */
  logout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Set JWT token
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Remove JWT token
   */
  removeToken(): void {
    localStorage.removeItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Save user to localStorage
   */
  private saveUserToStorage(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Load user from localStorage
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
      }
    }
  }
}