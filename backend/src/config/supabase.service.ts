import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

@Injectable()
export class SupabaseService {
  private readonly adminClient: SupabaseClient;

  constructor() {
    this.adminClient = createClient(env.supabaseUrl, env.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  /** Cliente con privilegios de servidor: solo para Auth y perfiles. */
  get admin(): SupabaseClient {
    return this.adminClient;
  }

  /** Cliente con el JWT del usuario: las políticas RLS se aplican. */
  forUser(accessToken: string): SupabaseClient {
    return createClient(env.supabaseUrl, env.anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
