import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

@Injectable()
export class SupabaseService {
  private readonly adminClient: SupabaseClient;

  constructor() {
    // Clave secreta: solo backend, bypassea RLS (equivalente a service_role).
    this.adminClient = createClient(env.supabaseUrl, env.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  /** Cliente con privilegios de servidor: solo para Auth y perfiles. */
  get admin(): SupabaseClient {
    return this.adminClient;
  }

  /** Cliente con el JWT del usuario: las políticas RLS se aplican. */
  forUser(accessToken: string): SupabaseClient {
    // Clave publicable: respeta RLS; el JWT del usuario va en Authorization.
    return createClient(env.supabaseUrl, env.publishableKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
