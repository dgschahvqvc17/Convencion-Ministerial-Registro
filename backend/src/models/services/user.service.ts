import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { SupabaseService } from '../../config/supabase.service';
import { ProfileRepository } from '../repositories/profile.repository';
import { RoleName, UserDto } from '../entities';

@Injectable()
export class UserService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly profiles: ProfileRepository,
  ) {}

  async create(input: {
    email: string;
    password: string;
    fullName: string;
    role: RoleName;
  }): Promise<UserDto> {
    const { data, error } = await this.supabase.admin.auth.admin.createUser({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName.trim() },
    });

    if (error || !data.user) {
      throw new AppError('CONFLICT', 409);
    }

    await this.profiles.setRole(data.user.id, input.role);
    const created = await this.profiles.findByUserId(data.user.id);
    if (!created) {
      throw new AppError('INTERNAL_ERROR', 500);
    }
    return created;
  }

  async list(): Promise<UserDto[]> {
    return this.profiles.list();
  }

  async assignRole(userId: string, role: RoleName): Promise<UserDto> {
    await this.profiles.setRole(userId, role);
    const updated = await this.profiles.findByUserId(userId);
    if (!updated) {
      throw new AppError('NOT_FOUND', 404);
    }
    return updated;
  }

  async setActive(userId: string, isActive: boolean): Promise<UserDto> {
    await this.profiles.setActive(userId, isActive);
    const updated = await this.profiles.findByUserId(userId);
    if (!updated) {
      throw new AppError('NOT_FOUND', 404);
    }
    return updated;
  }
}
