const PLACEHOLDER = 'pendiente-de-configurar';

export const env = {
  port: Number(process.env.PORT ?? 3000),
  supabaseUrl: process.env.SUPABASE_URL ?? PLACEHOLDER,
  anonKey: process.env.SUPABASE_ANON_KEY ?? PLACEHOLDER,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? PLACEHOLDER,
  cookieName: process.env.SESSION_COOKIE_NAME ?? 'convencion_session',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  isProduction: process.env.NODE_ENV === 'production',
};

/** Se llama al arrancar la API; las pruebas unitarias no necesitan credenciales reales. */
export function validateEnv(): void {
  const missing = [
    ['SUPABASE_URL', env.supabaseUrl],
    ['SUPABASE_ANON_KEY', env.anonKey],
    ['SUPABASE_SERVICE_ROLE_KEY', env.serviceRoleKey],
  ]
    .filter(([, value]) => !value || value === PLACEHOLDER)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Variables de entorno requeridas: ${missing.join(', ')}. Copie .env.example a .env.`);
  }
}
