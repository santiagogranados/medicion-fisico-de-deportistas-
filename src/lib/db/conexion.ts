import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';

export type { PoolClient } from 'pg';

types.setTypeParser(1082, (value) => value);
types.setTypeParser(1114, (value) => value);
types.setTypeParser(1184, (value) => value);
types.setTypeParser(20, (value) => Number.parseInt(value, 10));

type GlobalConPool = typeof globalThis & { poolRendimiento?: Pool };

async function crearPool(): Promise<Pool> {
  const connectionString = process.env.MEDIFIS_POSTGRES_URL;
  if (!connectionString) throw new Error('Falta MEDIFIS_POSTGRES_URL en el servidor.');
  const url = new URL(connectionString);
  if (url.port !== '6543') {
    throw new Error('MEDIFIS_POSTGRES_URL debe usar el pooler de Supabase (puerto 6543).');
  }

  const caPath = process.env.SUPABASE_DB_CA_CERT;
  const ssl = caPath
    ? {
        ca: await readFile(path.resolve(process.cwd(), caPath), 'utf8'),
        rejectUnauthorized: true,
      }
    : { rejectUnauthorized: true };

  return new Pool({
    connectionString,
    ssl,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  });
}

const globalConPool = globalThis as GlobalConPool;

export const pool = globalConPool.poolRendimiento ?? await crearPool();
if (process.env.NODE_ENV !== 'production') globalConPool.poolRendimiento = pool;

export async function consultar<T extends QueryResultRow>(sql: string, valores: unknown[] = []): Promise<T[]> {
  const resultado = await pool.query<T>(sql, valores);
  return resultado.rows;
}

export async function conTransaccion<T>(trabajo: (tx: PoolClient) => Promise<T>): Promise<T> {
  const tx = await pool.connect();
  let transactionStarted = false;
  try {
    await tx.query('BEGIN');
    transactionStarted = true;
    const resultado = await trabajo(tx);
    await tx.query('COMMIT');
    transactionStarted = false;
    return resultado;
  } catch (error) {
    if (transactionStarted) {
      try {
        await tx.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Falló el rollback de la transacción de rendimiento.', rollbackError);
        throw new AggregateError([error, rollbackError], 'Falló la transacción y su rollback.');
      }
    }
    throw error;
  } finally {
    tx.release();
  }
}
