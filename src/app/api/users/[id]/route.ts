import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase/admin';

const editUserSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  displayName: z.string().trim().min(1).max(100),
  role: z.enum(['admin', 'editor', 'viewer']),
  password: z.union([z.literal(''), z.string().min(12).max(128)]).optional().transform((password) => password || undefined),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const authorization = await requireSupabaseAdmin();
  if (authorization.response) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'El cuerpo de la solicitud no es JSON válido.' }, { status: 400 });
  }

  const parsed = editUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Nombre o rol inválido.' }, { status: 400 });
  const { id } = await context.params;

  if (id === authorization.userId && parsed.data.role !== 'admin') {
    const { count, error } = await authorization.supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (error || count === null || count <= 1) {
      return NextResponse.json({ success: false, error: 'No puedes quitar el único rol administrador.' }, { status: 409 });
    }
  }

  const { error: authError } = await authorization.supabase.auth.admin.updateUserById(id, {
    email: parsed.data.email,
    email_confirm: true,
    user_metadata: { display_name: parsed.data.displayName },
    ...(parsed.data.password ? { password: parsed.data.password } : {}),
  });
  if (authError) return NextResponse.json({ success: false, error: 'No se pudieron actualizar las credenciales del usuario.' }, { status: 400 });

  const { data, error } = await authorization.supabase
    .from('users')
    .update({ display_name: parsed.data.displayName, role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, display_name, role, created_at')
    .maybeSingle();
  if (error || !data) return NextResponse.json({ success: false, error: 'No se pudo actualizar el usuario.' }, { status: 400 });
  return NextResponse.json({ success: true, data });
}
