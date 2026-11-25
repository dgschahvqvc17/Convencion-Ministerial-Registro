import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { SupabaseService } from '../../config/supabase.service';
import {
  Church,
  ChurchDetail,
  District,
  Region,
  RegionKind,
} from '../entities';
import { unwrap, unwrapRows } from './repository.util';

export interface ChurchFilter {
  regionId?: string;
  districtId?: string;
  search?: string;
  page: number;
  pageSize: number;
}

type Row = Record<string, unknown>;
const str = (value: unknown): string => String(value ?? '');
const nullableStr = (value: unknown): string | null => (value == null ? null : String(value));

@Injectable()
export class StructureRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private db(token: string) {
    return this.supabase.forUser(token);
  }

  async listRegions(token: string): Promise<Region[]> {
    const rows = unwrapRows(
      await this.db(token)
        .from('regions')
        .select('id,name,kind,country,is_active,created_at')
        .eq('is_active', true)
        .order('name'),
    );
    return rows.map((row) => this.toRegion(row));
  }

  async createRegion(
    token: string,
    input: { name: string; kind: RegionKind; country: string },
  ): Promise<Region> {
    const row = unwrap(
      await this.db(token)
        .from('regions')
        .insert({ name: input.name.trim(), kind: input.kind, country: input.country })
        .select()
        .single(),
    );
    return this.toRegion(row as unknown as Row);
  }

  async updateRegion(
    token: string,
    id: string,
    input: { name: string; kind: RegionKind; country: string },
  ): Promise<Region> {
    const row = unwrap(
      await this.db(token)
        .from('regions')
        .update({ name: input.name.trim(), kind: input.kind, country: input.country })
        .eq('id', id)
        .select()
        .single(),
    );
    return this.toRegion(row as unknown as Row);
  }

  async deactivateRegion(token: string, id: string): Promise<void> {
    unwrap(await this.db(token).from('regions').update({ is_active: false }).eq('id', id));
  }

  async listDistricts(token: string, regionId?: string): Promise<District[]> {
    let query = this.db(token)
      .from('districts')
      .select('id,region_id,name,is_active,created_at')
      .eq('is_active', true)
      .order('name');
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    return unwrapRows(await query).map((row) => this.toDistrict(row));
  }

  async createDistrict(token: string, regionId: string, name: string): Promise<District> {
    const row = unwrap(
      await this.db(token)
        .from('districts')
        .insert({ region_id: regionId, name: name.trim() })
        .select()
        .single(),
    );
    return this.toDistrict(row as unknown as Row);
  }

  async updateDistrict(token: string, id: string, name: string): Promise<District> {
    const row = unwrap(
      await this.db(token)
        .from('districts')
        .update({ name: name.trim() })
        .eq('id', id)
        .select()
        .single(),
    );
    return this.toDistrict(row as unknown as Row);
  }

  async deactivateDistrict(token: string, id: string): Promise<void> {
    unwrap(await this.db(token).from('districts').update({ is_active: false }).eq('id', id));
  }

  async listChurches(
    token: string,
    filter: ChurchFilter,
  ): Promise<{ items: ChurchDetail[]; total: number }> {
    const db = this.db(token);
    let query = db
      .from('churches')
      .select('id,district_id,lead_pastor_id,name,address,is_active,created_at', { count: 'exact' })
      .eq('is_active', true)
      .order('name')
      .range((filter.page - 1) * filter.pageSize, filter.page * filter.pageSize - 1);

    if (filter.districtId) {
      query = query.eq('district_id', filter.districtId);
    }
    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const result = await query;
    const churches = unwrapRows(result).map((row) => this.toChurch(row));
    const total = result.count ?? churches.length;

    const districts = unwrapRows(
      await db.from('districts').select('id,name,region_id').eq('is_active', true),
    );
    const regions = unwrapRows(await db.from('regions').select('id,name').eq('is_active', true));
    const pastors = unwrapRows(
      await db.from('pastors').select('id,first_name,last_name,church_id').eq('is_active', true),
    );

    const districtMap = new Map(districts.map((d) => [str(d.id), d]));
    const regionMap = new Map(regions.map((r) => [str(r.id), str(r.name)]));
    const pastorMap = new Map(
      pastors.map((p) => [str(p.id), `${str(p.first_name)} ${str(p.last_name)}`]),
    );
    const countByChurch = new Map<string, number>();
    for (const pastor of pastors) {
      const churchId = nullableStr(pastor.church_id);
      if (churchId) {
        countByChurch.set(churchId, (countByChurch.get(churchId) ?? 0) + 1);
      }
    }

    const items = churches.map((church): ChurchDetail => {
      const district = districtMap.get(church.districtId);
      const districtName = district ? str(district.name) : '—';
      const regionName = district ? (regionMap.get(str(district.region_id)) ?? '—') : '—';
      return {
        ...church,
        districtName,
        regionName,
        leadPastorName: church.leadPastorId ? (pastorMap.get(church.leadPastorId) ?? null) : null,
        pastorCount: countByChurch.get(church.id) ?? 0,
      };
    });

    let filtered = items;
    if (filter.regionId) {
      const districtIds = new Set(
        districts.filter((d) => str(d.region_id) === filter.regionId).map((d) => str(d.id)),
      );
      filtered = items.filter((church) => districtIds.has(church.districtId));
    }

    return { items: filtered, total: filter.regionId ? filtered.length : total };
  }

  async getChurch(token: string, id: string): Promise<ChurchDetail | null> {
    const db = this.db(token);
    const { data: churchRow, error } = await db
      .from('churches')
      .select('id,district_id,lead_pastor_id,name,address,is_active,created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 500);
    }
    if (!churchRow) {
      return null;
    }

    const church = this.toChurch(churchRow as unknown as Row);
    const district = unwrap(
      await db.from('districts').select('name,region_id').eq('id', church.districtId).single(),
    ) as Row;
    const region = unwrap(
      await db.from('regions').select('name').eq('id', str(district.region_id)).single(),
    ) as Row;
    const leadPastor = church.leadPastorId
      ? (unwrap(
          await db
            .from('pastors')
            .select('first_name,last_name')
            .eq('id', church.leadPastorId)
            .maybeSingle(),
        ) as Row | null)
      : null;
    const { count } = await db
      .from('pastors')
      .select('id', { count: 'exact', head: true })
      .eq('church_id', church.id)
      .eq('is_active', true);

    return {
      ...church,
      districtName: str(district.name),
      regionName: str(region.name),
      leadPastorName: leadPastor
        ? `${str(leadPastor.first_name)} ${str(leadPastor.last_name)}`
        : null,
      pastorCount: count ?? 0,
    };
  }

  async createChurch(
    token: string,
    input: { districtId: string; name: string; address?: string; leadPastorId?: string | null },
  ): Promise<Church> {
    const row = unwrap(
      await this.db(token)
        .from('churches')
        .insert({
          district_id: input.districtId,
          name: input.name.trim(),
          address: input.address?.trim() || null,
          lead_pastor_id: input.leadPastorId ?? null,
        })
        .select()
        .single(),
    );
    return this.toChurch(row as unknown as Row);
  }

  async updateChurch(
    token: string,
    id: string,
    input: { districtId?: string; name: string; address?: string },
  ): Promise<Church> {
    const patch: Record<string, unknown> = {
      name: input.name.trim(),
      address: input.address?.trim() || null,
    };
    if (input.districtId) {
      patch.district_id = input.districtId;
    }
    const row = unwrap(
      await this.db(token)
        .from('churches')
        .update(patch)
        .eq('id', id)
        .select()
        .single(),
    );
    return this.toChurch(row as unknown as Row);
  }

  async assignLeadPastor(token: string, id: string, pastorId: string | null): Promise<Church> {
    const row = unwrap(
      await this.db(token)
        .from('churches')
        .update({ lead_pastor_id: pastorId })
        .eq('id', id)
        .select()
        .single(),
    );
    return this.toChurch(row as unknown as Row);
  }

  async deactivateChurch(token: string, id: string): Promise<void> {
    unwrap(await this.db(token).from('churches').update({ is_active: false }).eq('id', id));
  }

  private toRegion(row: Row): Region {
    return {
      id: str(row.id),
      name: str(row.name),
      kind: row.kind as RegionKind,
      country: str(row.country),
      isActive: Boolean(row.is_active),
      createdAt: str(row.created_at),
    };
  }

  private toDistrict(row: Row): District {
    return {
      id: str(row.id),
      regionId: str(row.region_id),
      name: str(row.name),
      isActive: Boolean(row.is_active),
      createdAt: str(row.created_at),
    };
  }

  private toChurch(row: Row): Church {
    return {
      id: str(row.id),
      districtId: str(row.district_id),
      leadPastorId: nullableStr(row.lead_pastor_id),
      name: str(row.name),
      address: nullableStr(row.address),
      isActive: Boolean(row.is_active),
      createdAt: str(row.created_at),
    };
  }
}
