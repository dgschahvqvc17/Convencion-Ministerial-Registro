import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { SupabaseService } from '../../config/supabase.service';
import {
  Attendance,
  AttendanceDetail,
  AttendanceStatus,
  Event,
  Pastor,
  PastorDetail,
  ReportRow,
} from '../entities';
import { unwrap, unwrapRows } from './repository.util';

type Row = Record<string, unknown>;
const str = (value: unknown): string => String(value ?? '');
const nullableStr = (value: unknown): string | null => (value == null ? null : String(value));

export interface AttendanceFilter {
  eventId?: string;
  regionId?: string;
  districtId?: string;
  churchId?: string;
  status?: AttendanceStatus;
  page: number;
  pageSize: number;
}

@Injectable()
export class RegistrationRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private db(token: string) {
    return this.supabase.forUser(token);
  }

  // ---------- Pastores ----------
  async listPastors(token: string, churchId?: string, search?: string): Promise<PastorDetail[]> {
    const db = this.db(token);
    let query = db
      .from('pastors')
      .select('id,church_id,first_name,last_name,registered_by,is_active,created_at')
      .eq('is_active', true)
      .order('last_name');
    if (churchId) {
      query = query.eq('church_id', churchId);
    }
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }
    const pastors = unwrapRows(await query).map((row) => this.toPastor(row));
    const [churches, profiles] = await Promise.all([
      db.from('churches').select('id,name').eq('is_active', true),
      this.supabase.admin.from('profiles').select('id,full_name'),
    ]);
    const churchMap = new Map(unwrapRows(churches).map((c) => [str(c.id), str(c.name)]));
    const profileMap = new Map(unwrapRows(profiles).map((p) => [str(p.id), str(p.full_name)]));

    return pastors.map((pastor) => ({
      ...pastor,
      churchName: pastor.churchId ? (churchMap.get(pastor.churchId) ?? null) : null,
      registeredByName: profileMap.get(pastor.registeredBy) ?? '—',
    }));
  }

  async createPastor(
    token: string,
    input: { churchId: string | null; firstName: string; lastName: string; registeredBy: string },
  ): Promise<Pastor> {
    const row = unwrap(
      await this.db(token)
        .from('pastors')
        .insert({
          church_id: input.churchId,
          first_name: input.firstName.trim(),
          last_name: input.lastName.trim(),
          registered_by: input.registeredBy,
        })
        .select()
        .single(),
    );
    return this.toPastor(row as unknown as Row);
  }

  async updatePastor(
    token: string,
    id: string,
    input: { churchId: string | null; firstName: string; lastName: string },
  ): Promise<Pastor> {
    const row = unwrap(
      await this.db(token)
        .from('pastors')
        .update({
          church_id: input.churchId,
          first_name: input.firstName.trim(),
          last_name: input.lastName.trim(),
        })
        .eq('id', id)
        .select()
        .single(),
    );
    return this.toPastor(row as unknown as Row);
  }

  async deactivatePastor(token: string, id: string): Promise<void> {
    unwrap(await this.db(token).from('pastors').update({ is_active: false }).eq('id', id));
  }

  // ---------- Eventos ----------
  async listEvents(token: string): Promise<Event[]> {
    const rows = unwrapRows(
      await this.db(token)
        .from('events')
        .select('id,name,motto,start_date,end_date,city,is_active')
        .order('start_date', { ascending: false }),
    );
    return rows.map((row) => ({
      id: str(row.id),
      name: str(row.name),
      motto: nullableStr(row.motto),
      startDate: str(row.start_date),
      endDate: str(row.end_date),
      city: nullableStr(row.city),
      isActive: Boolean(row.is_active),
    }));
  }

  async activeEvent(token: string): Promise<Event | null> {
    const rows = unwrapRows(
      await this.db(token)
        .from('events')
        .select('id,name,motto,start_date,end_date,city,is_active')
        .eq('is_active', true)
        .limit(1),
    );
    return rows.length ? this.toEvent(rows[0]) : null;
  }

  // ---------- Asistencia ----------
  async existsAttendance(token: string, eventId: string, pastorId: string): Promise<boolean> {
    const { count, error } = await this.db(token)
      .from('attendances')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('pastor_id', pastorId);
    if (error) {
      throw new AppError('INTERNAL_ERROR', 500);
    }
    return (count ?? 0) > 0;
  }

  async createAttendance(
    token: string,
    input: { eventId: string; pastorId: string; registeredBy: string; notes?: string },
  ): Promise<Attendance> {
    const row = unwrap(
      await this.db(token)
        .from('attendances')
        .insert({
          event_id: input.eventId,
          pastor_id: input.pastorId,
          registered_by: input.registeredBy,
          notes: input.notes?.trim() || null,
          status: 'registered',
        })
        .select()
        .single(),
    );
    return this.toAttendance(row as unknown as Row);
  }

  async listAttendances(
    token: string,
    filter: AttendanceFilter,
  ): Promise<{ items: AttendanceDetail[]; total: number }> {
    const db = this.db(token);
    let query = db
      .from('attendances')
      .select(
        'id,event_id,pastor_id,registered_by,status,checked_in_at,notes',
        { count: 'exact' },
      )
      .order('checked_in_at', { ascending: false })
      .range((filter.page - 1) * filter.pageSize, filter.page * filter.pageSize - 1);
    if (filter.eventId) query = query.eq('event_id', filter.eventId);
    if (filter.status) query = query.eq('status', filter.status);

    const result = await query;
    const rows = unwrapRows(result);
    const attendances = rows.map((row) => this.toAttendance(row));
    const total = result.count ?? attendances.length;
    if (!attendances.length) {
      return { items: [], total };
    }

    const pastorIds = [...new Set(attendances.map((a) => a.pastorId))];
    const [pastors, profiles, churches, districts] = await Promise.all([
      db.from('pastors').select('id,first_name,last_name,church_id').in('id', pastorIds),
      this.supabase.admin.from('profiles').select('id,full_name'),
      db.from('churches').select('id,name,district_id').eq('is_active', true),
      db.from('districts').select('id,region_id').eq('is_active', true),
    ]);
    const pastorMap = new Map(unwrapRows(pastors).map((p) => [str(p.id), p]));
    const profileMap = new Map(unwrapRows(profiles).map((p) => [str(p.id), str(p.full_name)]));
    const churchMap = new Map(unwrapRows(churches).map((c) => [str(c.id), c]));
    const districtMap = new Map(unwrapRows(districts).map((d) => [str(d.id), str(d.region_id)]));

    const items = attendances.map((attendance): AttendanceDetail => {
      const pastor = pastorMap.get(attendance.pastorId) as Row | undefined;
      const churchId = pastor ? nullableStr(pastor.church_id) : null;
      const church = churchId ? (churchMap.get(churchId) as Row | undefined) : undefined;
      return {
        ...attendance,
        pastorFullName: pastor
          ? `${str(pastor.first_name)} ${str(pastor.last_name)}`
          : 'Pastor no disponible',
        churchName: church ? str(church.name) : null,
        registeredByName: profileMap.get(attendance.registeredBy) ?? '—',
      };
    });

    return {
      items: this.filterByLocation(items, filter, pastorMap, churchMap, districtMap),
      total,
    };
  }

  async cancelAttendance(token: string, id: string): Promise<void> {
    unwrap(
      await this.db(token)
        .from('attendances')
        .update({ status: 'cancelled' })
        .eq('id', id),
    );
  }

  async countAttendances(token: string): Promise<number> {
    const { count, error } = await this.db(token)
      .from('attendances')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'cancelled');
    if (error) {
      throw new AppError('INTERNAL_ERROR', 500);
    }
    return count ?? 0;
  }

  async report(token: string): Promise<ReportRow[]> {
    const rows = unwrapRows(
      await this.db(token)
        .from('v_attendance_summary')
        .select('*')
        .order('church_name'),
    );
    return rows.map((row) => ({
      regionId: str(row.region_id),
      regionName: str(row.region_name),
      districtId: str(row.district_id),
      districtName: str(row.district_name),
      churchId: nullableStr(row.church_id),
      churchName: nullableStr(row.church_name),
      totalRegistered: Number(row.total_registered ?? 0),
      totalConfirmed: Number(row.total_confirmed ?? 0),
      lastCheckIn: nullableStr(row.last_check_in),
    }));
  }

  private filterByLocation(
    items: AttendanceDetail[],
    filter: AttendanceFilter,
    pastorMap: Map<string, unknown>,
    churchMap: Map<string, unknown>,
    districtMap: Map<string, string>,
  ): AttendanceDetail[] {
    if (!filter.churchId && !filter.districtId && !filter.regionId) {
      return items;
    }
    return items.filter((item) => {
      const pastor = pastorMap.get(item.pastorId) as Row | undefined;
      const churchId = pastor ? nullableStr(pastor.church_id) : null;
      const church = churchId ? (churchMap.get(churchId) as Row | undefined) : undefined;
      const districtId = church ? str(church.district_id) : null;
      if (filter.churchId) return churchId === filter.churchId;
      if (filter.districtId) return districtId === filter.districtId;
      return districtId ? districtMap.get(districtId) === filter.regionId : false;
    });
  }

  private toPastor(row: Row): Pastor {
    return {
      id: str(row.id),
      churchId: nullableStr(row.church_id),
      firstName: str(row.first_name),
      lastName: str(row.last_name),
      registeredBy: str(row.registered_by),
      isActive: Boolean(row.is_active),
      createdAt: str(row.created_at),
    };
  }

  private toEvent(row: Row): Event {
    return {
      id: str(row.id),
      name: str(row.name),
      motto: nullableStr(row.motto),
      startDate: str(row.start_date),
      endDate: str(row.end_date),
      city: nullableStr(row.city),
      isActive: Boolean(row.is_active),
    };
  }

  private toAttendance(row: Row): Attendance {
    return {
      id: str(row.id),
      eventId: str(row.event_id),
      pastorId: str(row.pastor_id),
      registeredBy: str(row.registered_by),
      status: row.status as AttendanceStatus,
      checkedInAt: str(row.checked_in_at),
      notes: nullableStr(row.notes),
    };
  }
}
