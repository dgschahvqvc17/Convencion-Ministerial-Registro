import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiSuccess,
  AttendanceDto,
  AttendanceStatus,
  EventDto,
  PaginatedDto,
  PastorDto,
} from '../api.types';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);

  events(): Observable<ApiSuccess<EventDto[]>> {
    return this.http.get<ApiSuccess<EventDto[]>>('/events');
  }

  activeEvent(): Observable<ApiSuccess<EventDto | null>> {
    return this.http.get<ApiSuccess<EventDto | null>>('/events/active');
  }

  pastors(churchId?: string, search?: string): Observable<ApiSuccess<PastorDto[]>> {
    const params: Record<string, string> = {};
    if (churchId) params['churchId'] = churchId;
    if (search) params['search'] = search;
    return this.http.get<ApiSuccess<PastorDto[]>>('/pastors', { params });
  }

  createPastor(body: { churchId: string | null; firstName: string; lastName: string }) {
    return this.http.post<ApiSuccess<PastorDto>>('/pastors', body);
  }

  updatePastor(
    id: string,
    body: { churchId?: string | null; firstName: string; lastName: string },
  ) {
    return this.http.patch<ApiSuccess<PastorDto>>(`/pastors/${id}`, body);
  }

  deletePastor(id: string) {
    return this.http.delete(`/pastors/${id}`);
  }

  attendances(params: {
    eventId?: string;
    churchId?: string;
    status?: AttendanceStatus;
    page?: number;
    pageSize?: number;
  }): Observable<ApiSuccess<PaginatedDto<AttendanceDto>>> {
    const query: Record<string, string> = {};
    if (params.eventId) query['eventId'] = params.eventId;
    if (params.churchId) query['churchId'] = params.churchId;
    if (params.status) query['status'] = params.status;
    if (params.page) query['page'] = String(params.page);
    if (params.pageSize) query['pageSize'] = String(params.pageSize);
    return this.http.get<ApiSuccess<PaginatedDto<AttendanceDto>>>('/attendances', {
      params: query,
    });
  }

  register(body: { eventId: string; pastorId: string; notes?: string }) {
    return this.http.post<ApiSuccess<AttendanceDto>>('/attendances', body);
  }

  cancelAttendance(id: string) {
    return this.http.patch(`/attendances/${id}/cancel`, {});
  }
}
