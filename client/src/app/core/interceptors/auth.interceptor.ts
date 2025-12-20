// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';
import { BehaviorSubject, Observable } from 'rxjs';

// Shared state for managing refresh token process
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone request with credentials for refresh token cookie
  let clonedReq = req.clone({
    withCredentials: true,
  });

  // Add access token if available (except for auth endpoints)
  if (token && !isAuthEndpoint(req.url)) {
    clonedReq = addToken(clonedReq, token);
  }

  return next(clonedReq).pipe(
    catchError((error) => {
      // Only handle 401 errors for non-auth endpoints
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        return handle401Error(req, next, authService);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Add Authorization header to request
 */
function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Check if URL is an auth endpoint
 */
function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/sign-in') || url.includes('/auth/register') || url.includes('/auth/refresh')
  );
}

/**
 * Handle 401 error with token refresh and request queuing
 */
function handle401Error(
  request: HttpRequest<any>,
  next: any,
  authService: AuthService
): Observable<any> {
  if (!isRefreshing) {
    // First 401 error - start refresh process
    isRefreshing = true;
    refreshTokenSubject.next(null);

    console.log('🔄 Token expired, refreshing...');

    return authService.refreshToken().pipe(
      switchMap((newToken: string) => {
        // Refresh successful
        isRefreshing = false;
        refreshTokenSubject.next(newToken);

        console.log('✅ Token refreshed, retrying original request');

        // Retry original request with new token
        return next(addToken(request, newToken));
      }),
      catchError((error) => {
        // Refresh failed
        isRefreshing = false;
        refreshTokenSubject.next(null);

        console.error('❌ Token refresh failed, redirecting to login');

        // AuthService already handles redirect to login
        return throwError(() => error);
      })
    );
  } else {
    // Subsequent 401 errors while refresh is in progress
    // Queue these requests until refresh completes
    console.log('⏳ Queueing request until token refresh completes...');

    return refreshTokenSubject.pipe(
      filter((token) => token !== null), // Wait for non-null token
      take(1), // Take only the first emission
      switchMap((token) => {
        console.log('✅ Token available, retrying queued request');
        // Retry request with new token
        return next(addToken(request, token!));
      })
    );
  }
}
