'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './config';

let client: SupabaseClient | undefined;

export function createSupabaseBrowserClient(): SupabaseClient {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error('Faltan la URL pública y la clave publicable de Supabase.');

  client ??= createBrowserClient(config.url, config.key);
  return client;
}
