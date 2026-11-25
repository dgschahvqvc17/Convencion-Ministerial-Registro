import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { SupabaseService } from '../../config/supabase.service';
import { ProfileRepository } from '../repositories/profile.repository';
import { SessionTokens, UserDto } from '../entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly profiles: ProfileRepository,
  ) {}

  async login(email: string, password: string): Promise<{ tokens: SessionTokens; user: UserDto }> {
    const { data, error } = await this.supabase.admin.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new AppError('INVALID_CREDENTIALS', 401);
    }

    const user = await this.profiles.findByUserId(data.session.user.id);
    if (!user || !user.isActive || !user.role) {
      throw new AppError('FORBIDDEN', 403);
    }

    return {
      tokens: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      user,
    };
  }
}
