import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiFailure } from '../../models/api.types';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_BASE_URL).replace(/\/$/, '');
  const url = request.url.startsWith('http') ? request.url : `${base}${request.url}`;

  return next(request.clone({ url, withCredentials: true })).pipe(
    catchError((error: HttpErrorResponse) => {
      const failure: ApiFailure = {
        status: error.status,
        code: error.error?.error?.code ?? 'INTERNAL_ERROR',
        message: error.error?.error?.message ?? 'No se pudo conectar con el servidor',
        details: error.error?.error?.details as Record<string, string> | undefined,
      };
      return throwError(() => failure);
    }),
  );
};
