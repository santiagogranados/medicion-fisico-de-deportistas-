import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from './server';
import { getSupabasePublicConfig } from './config';

type AdminAuthorization =
  | { supabase: SupabaseClient; userId: string; response?: never }
  | { supabase?: never; userId?: never; response: NextResponse };

export async function requireSupabaseAdmin(): Promise<AdminAuthorization> {
  const sessionClient = await createSupabaseServerClient();
  const { data: { user }, error } = await sessionClient.auth.getUser();
  if (error || !user) {
    return { response: NextResponse.json({ success: false, error: 'Autenticación requerida.' }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await sessionClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError || profile?.role !== 'admin') {
    return { response: NextResponse.json({ success: false, error: 'Se requiere rol administrador.' }, { status: 403 }) };
  }

  const config = getSupabasePublicConfig();
  const secretKey = process.env.MEDIFIS_SUPABASE_SECRET_KEY || process.env.MEDIFIS_SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !secretKey) {
    return { response: NextResponse.json({ success: false, error: 'Falta la clave privada de Supabase en el servidor.' }, { status: 503 }) };
  }

  return {
    supabase: createClient(config.url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } }),
    userId: user.id,
  };
}
