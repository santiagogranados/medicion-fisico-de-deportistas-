import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ success: false, error: 'Sesión no válida.' }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, display_name, role')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError || !profile) return NextResponse.json({ success: false, error: 'Perfil no encontrado.' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: { id: profile.id, email: profile.email, displayName: profile.display_name, role: profile.role },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Supabase no está configurado o no está disponible.' }, { status: 503 });
  }
}
