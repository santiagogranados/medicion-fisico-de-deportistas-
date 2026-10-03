import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const registerSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
  displayName: z.string().trim().min(1).max(100),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'El cuerpo de la solicitud no es JSON válido.' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Revisa el correo, el nombre y la contraseña (mínimo 12 caracteres).' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { display_name: parsed.data.displayName } },
    });

    if (error || !data.user) {
      return NextResponse.json({ success: false, error: 'No se pudo crear la cuenta. Comprueba si el correo ya está registrado.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      needsEmailConfirmation: !data.session,
      data: {
        id: data.user.id,
        email: data.user.email,
        displayName: parsed.data.displayName,
        role: 'viewer',
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Supabase no está configurado o no está disponible.' }, { status: 503 });
  }
}
