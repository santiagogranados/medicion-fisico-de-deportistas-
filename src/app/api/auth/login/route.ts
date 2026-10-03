import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/json-db';
import { verifyPassword } from '@/lib/auth/hash';
import { createSessionToken, sessionCookieName, sessionCookieOptions } from '@/lib/auth/session';
import { ensureUserCollection } from '@/lib/auth/users';
import type { UserRecord } from '@data/_schema/user.schema';

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
    await ensureUserCollection();
    const [user] = await query<UserRecord>('user', (record) => record.email === parsed.data.email && record.active);
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ success: false, error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });
    const response = NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    });
    response.cookies.set(sessionCookieName, token, sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'No se pudo iniciar sesión.' }, { status: 500 });
  }
}