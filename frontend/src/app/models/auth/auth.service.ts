import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiSuccess, UserDto } from '../api.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<ApiSuccess<UserDto>> {
    return this.http.post<ApiSuccess<UserDto>>('/auth/login', { email, password });
  }

  me(): Observable<ApiSuccess<UserDto>> {
    return this.http.get<ApiSuccess<UserDto>>('/auth/me');
  }

  logout(): Observable<unknown> {
    return this.http.post('/auth/logout', {});
  }
}
