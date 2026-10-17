import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128),
  confirmPassword: z.string().min(12).max(128),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ['confirmPassword'],
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'El cuerpo de la solicitud no es JSON válido.' }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'La nueva contraseña debe tener al menos 12 caracteres y coincidir con la confirmación.' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      return NextResponse.json({ success: false, error: 'Inicia sesión para cambiar tu contraseña.' }, { status: 401 });
    }

    const { error: verificationError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (verificationError) {
      return NextResponse.json({ success: false, error: 'La contraseña actual no es correcta.' }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
    if (updateError) {
      return NextResponse.json({ success: false, error: 'No se pudo cambiar la contraseña. Inténtalo de nuevo.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Supabase no está configurado o no está disponible.' }, { status: 503 });
  }
}