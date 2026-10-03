import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublicConfig } from '@/lib/supabase/config';

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

  const config = getSupabasePublicConfig();
  if (!config) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Supabase no está configurado.' }, { status: 503 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (user) return response;

  if (pathname.startsWith('/api/')) {
    const unauthorized = NextResponse.json({ success: false, error: 'Autenticación requerida.', code: 'UNAUTHORIZED' }, { status: 401 });
    response.cookies.getAll().forEach((cookie) => unauthorized.cookies.set(cookie));
    return unauthorized;
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  const redirect = NextResponse.redirect(loginUrl);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
