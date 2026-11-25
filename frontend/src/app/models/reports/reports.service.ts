import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiSuccess, DashboardStatsDto, ReportRowDto, UserDto } from '../api.types';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);

  stats(): Observable<ApiSuccess<DashboardStatsDto>> {
    return this.http.get<ApiSuccess<DashboardStatsDto>>('/reports/stats');
  }

  summary(): Observable<ApiSuccess<ReportRowDto[]>> {
    return this.http.get<ApiSuccess<ReportRowDto[]>>('/reports/summary');
  }

  users(): Observable<ApiSuccess<UserDto[]>> {
    return this.http.get<ApiSuccess<UserDto[]>>('/users');
  }

  createUser(body: { email: string; password: string; fullName: string; role: string }) {
    return this.http.post<ApiSuccess<UserDto>>('/users', body);
  }

  assignRole(id: string, role: string) {
    return this.http.patch<ApiSuccess<UserDto>>(`/users/${id}/role`, { role });
  }

  setActive(id: string, isActive: boolean) {
    return this.http.patch<ApiSuccess<UserDto>>(`/users/${id}/active`, { isActive });
  }
}
