import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

export type SesionRendimiento = { email: string };

export async function obtenerSesion(): Promise<SesionRendimiento | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return { email: data.user.email };
}

export async function exigirSesion(): Promise<SesionRendimiento> {
  const sesion = await obtenerSesion();
  if (!sesion) throw new ErrorDeNegocio('NO_AUTORIZADO');
  return sesion;
}
