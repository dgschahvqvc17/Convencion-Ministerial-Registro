export type RoleName = 'admin' | 'operator' | 'pastor' | 'viewer';
export type RegionKind = 'departamento' | 'region';
export type AttendanceStatus = 'registered' | 'confirmed' | 'cancelled';
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_NAME'
  | 'DUPLICATE_ATTENDANCE'
  | 'MISSING_PARENT'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export interface Region {
  id: string;
  name: string;
  kind: RegionKind;
  country: string;
  isActive: boolean;
  createdAt: string;
}

export interface District {
  id: string;
  regionId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Church {
  id: string;
  districtId: string;
  leadPastorId: string | null;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ChurchDetail extends Church {
  districtName: string;
  regionName: string;
  leadPastorName: string | null;
  pastorCount: number;
}

/** Solo nombre y apellido. Auditoría automática: created_at y registered_by. */
export interface Pastor {
  id: string;
  churchId: string | null;
  firstName: string;
  lastName: string;
  registeredBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface PastorDetail extends Pastor {
  churchName: string | null;
  registeredByName: string;
}

export interface Event {
  id: string;
  name: string;
  motto: string | null;
  startDate: string;
  endDate: string;
  city: string | null;
  isActive: boolean;
}

export interface Attendance {
  id: string;
  eventId: string;
  pastorId: string;
  registeredBy: string;
  status: AttendanceStatus;
  checkedInAt: string;
  notes: string | null;
}

export interface AttendanceDetail extends Attendance {
  pastorFullName: string;
  churchName: string | null;
  registeredByName: string;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: RoleName | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthUser extends UserDto {
  accessToken: string;
}

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

export interface ReportRow {
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

export interface DashboardStats {
  regions: number;
  districts: number;
  churches: number;
  pastors: number;
  attendance: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
