import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import pg from 'pg';

export const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectDirectory);

export async function createPostgresPool() {
  const connectionString = process.env.MEDIFIS_POSTGRES_URL;
  if (!connectionString) {
    throw new Error('Falta MEDIFIS_POSTGRES_URL en .env.local.');
  }

  let connectionUrl;
  try {
    connectionUrl = new URL(connectionString);
  } catch {
    throw new Error('MEDIFIS_POSTGRES_URL no es una URL válida.');
  }

  if (connectionUrl.port !== '6543') {
    throw new Error('MEDIFIS_POSTGRES_URL debe usar el pooler de Supabase (puerto 6543).');
  }

  let resolvedConnectionString = connectionString;
  let ssl;
  const caPath = process.env.SUPABASE_DB_CA_CERT;
  if (caPath) {
    for (const parameter of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) {
      connectionUrl.searchParams.delete(parameter);
    }
    resolvedConnectionString = connectionUrl.toString();
    ssl = {
      ca: await readFile(path.resolve(projectDirectory, caPath), 'utf8'),
      rejectUnauthorized: true,
    };
  }

  return new pg.Pool({
    connectionString: resolvedConnectionString,
    ...(ssl ? { ssl } : {}),
    connectionTimeoutMillis: 15_000,
    max: 1,
  });
}
