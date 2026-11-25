export type RoleName = 'admin' | 'operator' | 'pastor' | 'viewer';
export type RegionKind = 'departamento' | 'region';
export type AttendanceStatus = 'registered' | 'confirmed' | 'cancelled';

export interface ApiSuccess<T> {
  data: T;
  meta?: { total: number; page: number; pageSize: number };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface ApiFailure {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: RoleName | null;
  isActive: boolean;
  createdAt: string;
}

export interface RegionDto {
  id: string;
  name: string;
  kind: RegionKind;
  country: string;
  isActive: boolean;
  createdAt: string;
}

export interface DistrictDto {
  id: string;
  regionId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChurchDto {
  id: string;
  districtId: string;
  leadPastorId: string | null;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  districtName: string;
  regionName: string;
  leadPastorName: string | null;
  pastorCount: number;
}

export interface PastorDto {
  id: string;
  churchId: string | null;
  firstName: string;
  lastName: string;
  registeredBy: string;
  isActive: boolean;
  createdAt: string;
  churchName: string | null;
  registeredByName: string;
}

export interface EventDto {
  id: string;
  name: string;
  motto: string | null;
  startDate: string;
  endDate: string;
  city: string | null;
  isActive: boolean;
}

export interface AttendanceDto {
  id: string;
  eventId: string;
  pastorId: string;
  registeredBy: string;
  status: AttendanceStatus;
  checkedInAt: string;
  notes: string | null;
  pastorFullName: string;
  churchName: string | null;
  registeredByName: string;
}

export interface ReportRowDto {
  regionId: string;
  regionName: string;
  districtId: string;
  districtName: string;
  churchId: string | null;
  churchName: string | null;
  totalRegistered: number;
  totalConfirmed: number;
  lastCheckIn: string | null;
}

export interface DashboardStatsDto {
  regions: number;
  districts: number;
  churches: number;
  pastors: number;
  attendance: number;
}

export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
