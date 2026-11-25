import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { RoleName, UserDto } from '../entities';
import { unwrap, unwrapRows } from './repository.util';

type Row = Record<string, unknown>;
const str = (value: unknown): string => String(value ?? '');

@Injectable()
export class ProfileRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findByUserId(userId: string): Promise<UserDto | null> {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('id,full_name,is_active,created_at,role_id,roles(name)')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      return null;
    }
    const { data: authUser } = await this.supabase.admin.auth.admin.getUserById(userId);
    return this.toUser(data as unknown as Row, authUser?.user?.email ?? '');
  }

  async list(): Promise<UserDto[]> {
    const profiles = unwrapRows(
      await this.supabase.admin
        .from('profiles')
        .select('id,full_name,is_active,created_at,role_id,roles(name)')
        .order('full_name'),
    );
    const { data: usersData } = await this.supabase.admin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? '']));
    return profiles.map((row) => this.toUser(row, emailMap.get(str(row.id)) ?? ''));
  }

  async setRole(userId: string, role: RoleName): Promise<void> {
    const roleRow = unwrap(
      await this.supabase.admin.from('roles').select('id').eq('name', role).single(),
    );
    unwrap(
      await this.supabase.admin
        .from('profiles')
        .update({ role_id: (roleRow as unknown as Row).id })
        .eq('id', userId),
    );
  }

  async setActive(userId: string, isActive: boolean): Promise<void> {
    unwrap(await this.supabase.admin.from('profiles').update({ is_active: isActive }).eq('id', userId));
  }

  private toUser(row: Row, email: string): UserDto {
    const role = (row.roles as { name: RoleName } | null)?.name ?? null;
    return {
      id: str(row.id),
      email,
      fullName: str(row.full_name),
      role,
      isActive: Boolean(row.is_active),
      createdAt: str(row.created_at),
    };
  }
}
