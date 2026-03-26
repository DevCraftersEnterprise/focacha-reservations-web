import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const request = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
    })
    : req;


  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getAccessToken()) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
