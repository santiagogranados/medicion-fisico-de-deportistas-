import { NextRequest, NextResponse } from 'next/server';
import { readSessionToken, sessionCookieName } from '@/lib/auth/session';

const publicPaths = new Set([
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/health',
]);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (publicPaths.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(sessionCookieName)?.value;
  if (token && (await readSessionToken(token))) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'Autenticación requerida.', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};