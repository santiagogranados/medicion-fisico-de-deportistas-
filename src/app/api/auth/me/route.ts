import { NextRequest, NextResponse } from 'next/server';
import { readSessionToken, sessionCookieName } from '@/lib/auth/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(sessionCookieName)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Sesión no válida.' }, { status: 401 });
  return NextResponse.json({ success: true, data: session });
}