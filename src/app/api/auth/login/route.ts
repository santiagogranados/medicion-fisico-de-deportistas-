import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'El cuerpo de la solicitud no es JSON válido.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Correo o contraseña incorrectos.' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user) {
      return NextResponse.json({ success: false, error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, display_name, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'No se encontró el perfil. Aplica la migración de Supabase.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      data: { id: profile.id, email: profile.email, displayName: profile.display_name, role: profile.role },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Supabase no está configurado o no está disponible.' }, { status: 503 });
  }
}
