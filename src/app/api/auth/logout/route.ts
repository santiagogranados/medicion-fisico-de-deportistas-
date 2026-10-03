import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Supabase no está configurado o no está disponible.' }, { status: 503 });
  }
}
