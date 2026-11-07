import { createPostgresPool } from './postgres.mjs';

const pool = await createPostgresPool();
const esLimpiezaDePrueba = process.argv[2] === '--prueba';
if (!esLimpiezaDePrueba) {
  console.error('Uso: npm run db:limpiar -- --prueba');
  await pool.end();
  process.exitCode = 1;
} else {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const codigos = [901, 902];
    const { rows } = await client.query(
      `SELECT id FROM public.jugadores
        WHERE codigo = ANY($1::integer[])
          AND ((codigo = 901 AND nombre = 'Prueba Carlos')
            OR (codigo = 902 AND nombre = 'Prueba Daniel'))`,
      [codigos],
    );
    const ids = rows.map((row) => row.id);
    if (ids.length > 0) {
      await client.query('DELETE FROM public.mediciones WHERE jugador_id = ANY($1::uuid[])', [ids]);
      await client.query('DELETE FROM public.jugadores WHERE id = ANY($1::uuid[])', [ids]);
    }
    await client.query('COMMIT');
    console.log(`Registros de prueba eliminados: ${ids.length}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('No se pudieron limpiar los datos de prueba.');
    console.error(error instanceof Error ? error.name : 'Error desconocido');
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
