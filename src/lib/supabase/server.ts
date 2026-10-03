import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublicConfig } from './config';

export async function createSupabaseServerClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error('Faltan la URL pública y la clave publicable de Supabase.');

  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components no permiten escribir cookies; middleware renueva la sesión.
        }
      },
    },
  });
}