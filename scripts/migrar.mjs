import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createPostgresPool, projectDirectory } from './postgres.mjs';

const migrationDirectory = path.join(projectDirectory, 'supabase', 'migrations');
const migrationPattern = /^\d{12}_.+\.sql$/;
let pool;
let phase = 'inicialización';

function postgresCode(error) {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof error.code === 'string') return error.code;
    if ('cause' in error && error.cause && typeof error.cause === 'object'
      && 'code' in error.cause && typeof error.cause.code === 'string') {
      return error.cause.code;
    }
    const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
    if (/connection terminated due to connection timeout/i.test(message)) return 'TIMEOUT';
    if (/connection terminated unexpectedly/i.test(message)) return 'CONNECTION_TERMINATED';
  }
  return 'UNKNOWN';
}

try {
  pool = await createPostgresPool();
  phase = 'conexión';
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public._migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  phase = 'lectura de migraciones';
  const migrations = (await readdir(migrationDirectory))
    .filter((name) => migrationPattern.test(name))
    .sort((left, right) => left.localeCompare(right));

  if (migrations.length === 0) {
    throw new Error('No se encontraron archivos de migración numerados.');
  }

  for (const name of migrations) {
    const sql = await readFile(path.join(migrationDirectory, name), 'utf8');
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      phase = `migración ${name}`;
      await client.query('BEGIN');
      transactionStarted = true;
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['medifis.migrations']);

      const { rows } = await client.query(
        'SELECT 1 FROM public._migrations WHERE name = $1',
        [name],
      );
      if (rows.length > 0) {
        await client.query('ROLLBACK');
        transactionStarted = false;
        console.log(`Omitida: ${name}`);
        continue;
      }

      await client.query(sql);
      await client.query('INSERT INTO public._migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      transactionStarted = false;
      console.log(`Aplicada: ${name}`);
    } catch (error) {
      if (transactionStarted) {
        await client.query('ROLLBACK');
        transactionStarted = false;
      }
      throw error;
    } finally {
      client.release();
    }
  }
} catch (error) {
  console.error(`No se pudo completar ${phase}; código de error: ${postgresCode(error)}.`);
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
