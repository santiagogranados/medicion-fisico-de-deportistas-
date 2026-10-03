// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { getSupabasePublicConfig } from './config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

describe('configuración pública de Supabase', () => {
  it('reconoce las variables que genera la integración de Vercel', () => {
    expect(getSupabasePublicConfig({
      NEXT_PUBLIC_MEDIFIS_MEDIFISSUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_MEDIFIS_MEDIFISSUPABASE_PUBLISHABLE_KEY: 'publishable-test-key',
    })).toEqual({
      url: 'https://project.supabase.co',
      key: 'publishable-test-key',
    });
  });

  it('no crea una configuración incompleta', () => {
    expect(getSupabasePublicConfig({
      NEXT_PUBLIC_MEDIFIS_MEDIFISSUPABASE_URL: 'https://project.supabase.co',
    })).toBeNull();
  });

  it('crea perfiles desde auth.users y limita las consultas con RLS', async () => {
    const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/202610030001_create_users.sql');
    const migration = await readFile(migrationPath, 'utf8');
    expect(migration).toMatch(/references auth\.users\s*\(id\) on delete cascade/i);
    expect(migration).toMatch(/enable row level security/i);
    expect(migration).toMatch(/auth\.uid\(\).*?= id/is);
    expect(migration).toMatch(/after insert or update of email, raw_user_meta_data on auth\.users/i);
    expect(migration).toMatch(/pg_advisory_xact_lock/);
    expect(migration).toMatch(/initial_role := 'admin'/);
    expect(migration).not.toMatch(/password_hash|password_hashes/i);
  });
});
