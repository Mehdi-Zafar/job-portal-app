// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      const isRefreshEndpoint = req.url.includes('/refresh');
      if (error.status === 401 && !isRefreshEndpoint) {
        // Unauthorized - redirect to login
        // router.navigate(['/sign-in']);
      }

      // Return error for handling in components
      return throwError(() => error);
    })
  );
};