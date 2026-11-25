import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiSuccess,
  ChurchDto,
  DistrictDto,
  PaginatedDto,
  RegionDto,
  RegionKind,
} from '../api.types';

@Injectable({ providedIn: 'root' })
export class StructureService {
  private readonly http = inject(HttpClient);

  regions(): Observable<ApiSuccess<RegionDto[]>> {
    return this.http.get<ApiSuccess<RegionDto[]>>('/regions');
  }

  createRegion(body: { name: string; kind: RegionKind; country?: string }) {
    return this.http.post<ApiSuccess<RegionDto>>('/regions', body);
  }

  updateRegion(id: string, body: { name: string; kind: RegionKind; country?: string }) {
    return this.http.patch<ApiSuccess<RegionDto>>(`/regions/${id}`, body);
  }

  deleteRegion(id: string) {
    return this.http.delete(`/regions/${id}`);
  }

  districts(regionId?: string): Observable<ApiSuccess<DistrictDto[]>> {
    return this.http.get<ApiSuccess<DistrictDto[]>>('/districts', {
      params: regionId ? { regionId } : {},
    });
  }

  createDistrict(body: { regionId: string; name: string }) {
    return this.http.post<ApiSuccess<DistrictDto>>('/districts', body);
  }

  updateDistrict(id: string, name: string) {
    return this.http.patch<ApiSuccess<DistrictDto>>(`/districts/${id}`, { name });
  }

  deleteDistrict(id: string) {
    return this.http.delete(`/districts/${id}`);
  }

  churches(params: {
    regionId?: string;
    districtId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<ApiSuccess<PaginatedDto<ChurchDto>>> {
    const query: Record<string, string> = {};
    if (params.regionId) query['regionId'] = params.regionId;
    if (params.districtId) query['districtId'] = params.districtId;
    if (params.search) query['search'] = params.search;
    if (params.page) query['page'] = String(params.page);
    if (params.pageSize) query['pageSize'] = String(params.pageSize);
    return this.http.get<ApiSuccess<PaginatedDto<ChurchDto>>>('/churches', { params: query });
  }

  createChurch(body: { districtId: string; name: string; address?: string }) {
    return this.http.post<ApiSuccess<ChurchDto>>('/churches', body);
  }

  updateChurch(id: string, body: { name: string; districtId?: string; address?: string }) {
    return this.http.patch<ApiSuccess<ChurchDto>>(`/churches/${id}`, body);
  }

  assignPastor(id: string, leadPastorId: string | null) {
    return this.http.patch<ApiSuccess<ChurchDto>>(`/churches/${id}/pastor`, { leadPastorId });
  }

  deleteChurch(id: string) {
    return this.http.delete(`/churches/${id}`);
  }
}
