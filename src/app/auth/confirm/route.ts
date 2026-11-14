import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const code = request.nextUrl.searchParams.get('code');
  const type = request.nextUrl.searchParams.get('type');
  const isRecovery = type === 'recovery';
  const isEmailChange = type === 'email_change';
  const destination = new URL(isRecovery ? '/actualizar-contrasena' : '/login', request.url);

  if ((!tokenHash && !code) || (!isRecovery && !isEmailChange)) {
    destination.pathname = '/login';
    destination.searchParams.set('error', 'enlace-invalido');
    return NextResponse.redirect(destination);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: isRecovery ? 'recovery' : 'email_change' })
      : await supabase.auth.exchangeCodeForSession(code!);
    if (!error) return NextResponse.redirect(destination);
  } catch {
    destination.pathname = '/login';
    destination.searchParams.set('error', 'restablecimiento-no-disponible');
    return NextResponse.redirect(destination);
  }

  destination.pathname = '/login';
  destination.searchParams.set('error', 'enlace-invalido');
  return NextResponse.redirect(destination);
}
