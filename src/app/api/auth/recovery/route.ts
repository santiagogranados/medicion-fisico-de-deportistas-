import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const recoverySchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Escribe un correo electrónico válido.' }, { status: 400 });
  }

  const parsed = recoverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Escribe un correo electrónico válido.' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: 'https://medifis.vercel.app/auth/confirm',
    });

    if (error) {
      if (error.status === 429) {
        return NextResponse.json({
          success: false,
          error: 'Se solicitaron varios enlaces recientemente. Espera un poco antes de volver a intentarlo y revisa también tu correo y la carpeta de spam.',
        }, { status: 429 });
      }
      return NextResponse.json({ success: false, error: 'No se pudo solicitar el restablecimiento. Inténtalo de nuevo más tarde.' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'El servicio de acceso no está disponible. Inténtalo de nuevo más tarde.' }, { status: 503 });
  }
}
