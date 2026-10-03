import { SignJWT, jwtVerify } from 'jose';

export const sessionCookieName = 'medifis_session';
const sessionLifetimeSeconds = 60 * 60 * 24;

export interface AuthSession {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
}

function signingKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (secret) {
    if (secret.length < 32) throw new Error('AUTH_SECRET debe tener al menos 32 caracteres.');
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET es obligatorio en producción.');
  return new TextEncoder().encode('medifis-local-development-secret-change-before-deploy');
}

export async function createSessionToken(user: AuthSession): Promise<string> {
  return new SignJWT({ email: user.email, displayName: user.displayName, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${sessionLifetimeSeconds}s`)
    .sign(signingKey());
}

export async function readSessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, signingKey());
    const role = payload.role;
    if (
      !payload.sub ||
      typeof payload.email !== 'string' ||
      typeof payload.displayName !== 'string' ||
      (role !== 'admin' && role !== 'editor' && role !== 'viewer')
    ) {
      return null;
    }
    return { id: payload.sub, email: payload.email, displayName: payload.displayName, role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: sessionLifetimeSeconds,
};