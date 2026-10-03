function firstConfigured(...values: (string | undefined)[]): string | null {
  return values.find((value) => value?.trim())?.trim() ?? null;
}

export function getSupabasePublicConfig(environment: Record<string, string | undefined> = process.env): { url: string; key: string } | null {
  const url = firstConfigured(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_MEDIFIS_MEDIFISSUPABASE_URL,
  );
  const key = firstConfigured(
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    environment.NEXT_PUBLIC_MEDIFIS_MEDIFISSUPABASE_PUBLISHABLE_KEY,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    environment.NEXT_PUBLIC_MEDIFIS_MEDIFISSUPABASE_ANON_KEY,
    environment.MEDIFIS_SUPABASE_PUBLISHABLE_KEY,
  );
  return url && key ? { url, key } : null;
}