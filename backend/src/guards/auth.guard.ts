import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import { env } from '../config/env';
import { SupabaseService } from '../config/supabase.service';
import { AuthUser, RoleName, SessionTokens } from '../models/entities';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type RequestWithAuth = Request & {
  cookies?: Record<string, string>;
  user?: AuthUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithAuth>();
    const response = http.getResponse<Response>();
    const raw = request.cookies?.[env.cookieName];

    if (!raw) {
      throw new AppError('UNAUTHORIZED', 401);
    }

    let tokens: SessionTokens;
    try {
      tokens = JSON.parse(raw) as SessionTokens;
    } catch {
      throw new AppError('UNAUTHORIZED', 401);
    }

    let identity = await this.verify(tokens.access_token);

    if (!identity && tokens.refresh_token) {
      const { data, error } = await this.supabase.admin.auth.refreshSession({
        refresh_token: tokens.refresh_token,
      });
      if (error || !data.session) {
        throw new AppError('UNAUTHORIZED', 401);
      }
      tokens = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
      response.cookie(env.cookieName, JSON.stringify(tokens), this.cookieOptions());
      identity = {
        id: data.session.user.id,
        email: data.session.user.email ?? '',
        createdAt: data.session.user.created_at ?? '',
      };
    }

    if (!identity) {
      throw new AppError('UNAUTHORIZED', 401);
    }

    const { data: profile, error: profileError } = await this.supabase.admin
      .from('profiles')
      .select('id, full_name, is_active, role_id, roles(name)')
      .eq('id', identity.id)
      .single();

    if (profileError || !profile || !profile.is_active) {
      throw new AppError('FORBIDDEN', 403);
    }

    const role = (profile.roles as unknown as { name: RoleName } | null)?.name ?? null;

    request.user = {
      id: profile.id as string,
      email: identity.email,
      fullName: profile.full_name as string,
      role,
      isActive: profile.is_active as boolean,
      createdAt: identity.createdAt,
      accessToken: tokens.access_token,
    };

    return true;
  }

  private async verify(
    token: string,
  ): Promise<{ id: string; email: string; createdAt: string } | null> {
    const { data, error } = await this.supabase.admin.auth.getUser(token);
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? '',
      createdAt: data.user.created_at ?? '',
    };
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax' as const,
      maxAge: 1000 * 60 * 60 * 8,
      path: '/',
    };
  }
}
