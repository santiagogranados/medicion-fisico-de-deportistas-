import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { CreateInput } from '@/lib/types';
import { create, query } from '@/lib/json-db';
import { hashPassword } from '@/lib/auth/hash';
import { createSessionToken, sessionCookieName, sessionCookieOptions } from '@/lib/auth/session';
import { ensureUserCollection } from '@/lib/auth/users';
import type { UserRecord } from '@data/_schema/user.schema';

const registerSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
  displayName: z.string().trim().min(1).max(100),
});

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'El registro local está deshabilitado.' }, { status: 403 });
  }

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
    await ensureUserCollection();
    const existingUsers = await query<UserRecord>('user', () => true);
    if (existingUsers.some((user) => user.email === parsed.data.email)) {
      return NextResponse.json({ success: false, error: 'No se pudo crear la cuenta con esos datos.' }, { status: 409 });
    }

    const user = await create<UserRecord>('user', {
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      passwordHash: await hashPassword(parsed.data.password),
      role: existingUsers.length === 0 ? 'admin' : 'viewer',
      active: true,
    } as CreateInput<UserRecord>);

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });
    const response = NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    }, { status: 201 });
    response.cookies.set(sessionCookieName, token, sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'No se pudo crear la cuenta.' }, { status: 500 });
  }
}