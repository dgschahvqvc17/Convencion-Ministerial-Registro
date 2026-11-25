import 'dotenv/config';

const PLACEHOLDER = 'pendiente-de-configurar';
const SIN_CONFIGURAR = /PEGA_AQUI|TU[-_]PROYECTO|TU_ANON|TU_SERVICE|pendiente-de-configurar/i;

/**
 * Lee la primera variable configurada. Acepta las claves nuevas de Supabase
 * (`sb_publishable_` / `sb_secret_`) y, como respaldo, las heredadas
 * (`anon` / `service_role`), que Supabase retira a fin de 2026.
 */
function readEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim() ?? '';
    if (value && !SIN_CONFIGURAR.test(value)) return value;
  }
  return PLACEHOLDER;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  supabaseUrl: readEnv('SUPABASE_URL'),
  publishableKey: readEnv('SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY'),
  secretKey: readEnv('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'),
  cookieName: process.env.SESSION_COOKIE_NAME ?? 'convencion_session',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  isProduction: process.env.NODE_ENV === 'production',
};

/** Se llama al arrancar la API; las pruebas unitarias no necesitan credenciales reales. */
export function validateEnv(): void {
  const missing = [
    ['SUPABASE_URL', env.supabaseUrl],
    ['SUPABASE_PUBLISHABLE_KEY (o SUPABASE_ANON_KEY)', env.publishableKey],
    ['SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY)', env.secretKey],
  ]
    .filter(([, value]) => value === PLACEHOLDER)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Variables de entorno requeridas: ${missing.join(', ')}. Copie .env.example a .env.`,
    );
  }
}
