import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const changeEmailSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'El cuerpo de la solicitud no es JSON válido.' }, { status: 400 });
  }

  const parsed = changeEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Escribe un correo válido y tu contraseña actual.' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      return NextResponse.json({ success: false, error: 'Inicia sesión para cambiar tu correo.' }, { status: 401 });
    }

    if (user.email.toLowerCase() === parsed.data.email) {
      return NextResponse.json({ success: false, error: 'Ese ya es el correo de tu cuenta.' }, { status: 400 });
    }

    const { error: verificationError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (verificationError) {
      return NextResponse.json({ success: false, error: 'La contraseña actual no es correcta.' }, { status: 400 });
    }

    const emailRedirectTo = new URL('/auth/confirm?type=email_change', request.url).toString();
    const { error: updateError } = await supabase.auth.updateUser(
      { email: parsed.data.email },
      { emailRedirectTo },
    );
    if (updateError) {
      return NextResponse.json({ success: false, error: 'No se pudo solicitar el cambio de correo. Comprueba el buzón e inténtalo de nuevo.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Revisa tu nuevo correo para confirmar el cambio. La cuenta seguirá usando el correo actual hasta completar la confirmación.',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Supabase no está configurado o no está disponible.' }, { status: 503 });
  }
}
