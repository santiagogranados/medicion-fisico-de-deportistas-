import { NextResponse } from 'next/server';
import { sessionCookieName, sessionCookieOptions } from '@/lib/auth/session';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieName, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}