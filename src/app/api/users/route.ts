import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase/admin';

const createUserSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  displayName: z.string().trim().min(1).max(100),
  password: z.string().min(12).max(128),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export async function GET(): Promise<NextResponse> {
  const authorization = await requireSupabaseAdmin();
  if (authorization.response) return authorization.response;

  const { data, error } = await authorization.supabase
    .from('users')
    .select('id, email, display_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ success: false, error: 'No se pudieron cargar los usuarios.' }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request): Promise<NextResponse> {
  const authorization = await requireSupabaseAdmin();
  if (authorization.response) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'El cuerpo de la solicitud no es JSON válido.' }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Revisa correo, nombre y contraseña (mínimo 12 caracteres).' }, { status: 400 });
  }

  const { data: created, error: createError } = await authorization.supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { display_name: parsed.data.displayName },
  });
  if (createError || !created.user) {
    return NextResponse.json({ success: false, error: 'No se pudo crear la cuenta. Comprueba si el correo ya está registrado.' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await authorization.supabase
    .from('users')
    .update({ display_name: parsed.data.displayName, role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq('id', created.user.id)
    .select('id, email, display_name, role, created_at')
    .single();

  if (profileError || !profile) {
    await authorization.supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ success: false, error: 'No se pudo guardar el perfil y se revirtió la cuenta.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: profile }, { status: 201 });
}
