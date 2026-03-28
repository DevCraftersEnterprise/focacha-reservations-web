import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  // Add required headers for backend CORS configuration
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const request = req.clone({
    setHeaders: headers,
    withCredentials: true, // Required for CORS with credentials
  });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors
      if (error.status === 401 && authService.getAccessToken()) {
        authService.logout();
        return throwError(() => error);
      }

      // Handle rate limiting
      if (error.status === 429) {
        console.warn('⚠️ Too many requests. Please try again later.');
        // You can show a toast notification here
      }

      // Handle network errors
      if (error.status === 0) {
        console.error('❌ Network error. Please check your connection.');
      }

      return throwError(() => error);
    })
  );
};
