import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import pg from 'pg';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectDirectory);

const connectionString = process.env.MEDIFIS_POSTGRES_URL_NON_POOLING
  || process.env.MEDIFIS_POSTGRES_URL
  || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Falta MEDIFIS_POSTGRES_URL_NON_POOLING, MEDIFIS_POSTGRES_URL o DATABASE_URL en .env.local.');
  process.exitCode = 1;
} else {
  const migrationPath = path.join(projectDirectory, 'supabase', 'migrations', '202610030001_create_users.sql');
  const migration = await readFile(migrationPath, 'utf8');
  const caPath = process.env.SUPABASE_DB_CA_CERT;
  let ssl;
  let resolvedConnectionString = connectionString;

  if (caPath) {
    const connectionUrl = new URL(connectionString);
    for (const parameter of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) connectionUrl.searchParams.delete(parameter);
    resolvedConnectionString = connectionUrl.toString();
    ssl = { ca: await readFile(path.resolve(projectDirectory, caPath), 'utf8'), rejectUnauthorized: true };
  }

  const client = new pg.Client({
    connectionString: resolvedConnectionString,
    ...(ssl ? { ssl } : {}),
    connectionTimeoutMillis: 15000,
  });
  let phase = 'connection';
  let transactionStarted = false;

  try {
    await client.connect();
    await client.query('begin');
    transactionStarted = true;
    phase = 'migration';
    await client.query(migration);
    await client.query('commit');
    transactionStarted = false;
    console.log('Migración aplicada: public.users con RLS y trigger de perfiles.');
  } catch (error) {
    if (transactionStarted) await client.query('rollback').catch(() => undefined);
    const details = error instanceof Error ? error : new Error('unknown');
    const code = 'code' in details && typeof details.code === 'string' ? details.code : 'UNKNOWN';
    console.error(`No se pudo completar la ${phase}; código de error: ${code}. No se imprimieron credenciales ni SQL.`);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}