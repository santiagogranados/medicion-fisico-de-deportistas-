import { createPostgresPool } from './postgres.mjs';
import { registrarJugador } from '../src/lib/dataService';
import { pool as poolAplicacion } from '../src/lib/db/conexion';

const demostracion = [
  {
    codigo: 9901, nombre: 'Carlos Pérez', edad: 24, posicion: 'Delantero',
    distancia: 8200, tiempoPrueba: 4, velocidadMaxima: 32.4, frecuenciaCardiaca: 175,
    recuperacion: 55, sprints: 18,
  },
  {
    codigo: 9902, nombre: 'Juan Gómez', edad: 22, posicion: 'Extremo',
    distancia: 7000, tiempoPrueba: 4.2, velocidadMaxima: 27.1, frecuenciaCardiaca: 160,
    recuperacion: 90, sprints: 16,
  },
  {
    codigo: 9903, nombre: 'Andrés Rodríguez', edad: 27, posicion: 'Mediocampista',
    distancia: 7800, tiempoPrueba: 4.1, velocidadMaxima: 29, frecuenciaCardiaca: 181,
    recuperacion: 125, sprints: 14,
  },
  {
    codigo: 9904, nombre: 'Mateo Torres', edad: 23, posicion: 'Defensa',
    distancia: 6200, tiempoPrueba: 4.4, velocidadMaxima: 26.4, frecuenciaCardiaca: 155,
    recuperacion: 105, sprints: 12,
  },
  {
    codigo: 9905, nombre: 'Daniel Castro', edad: 21, posicion: 'Delantero',
    distancia: 5100, tiempoPrueba: 4.6, velocidadMaxima: 24.1, frecuenciaCardiaca: 185,
    recuperacion: 115, sprints: 9,
  },
];

const pool = await createPostgresPool();
try {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const codigos = demostracion.map(({ codigo }) => codigo);
    const { rows } = await client.query(
      `SELECT id, codigo, nombre FROM public.jugadores WHERE codigo = ANY($1::integer[])`,
      [codigos],
    );
    const porCodigo = new Map(demostracion.map(({ codigo, nombre }) => [codigo, nombre]));
    const ajenos = rows.filter((row) => porCodigo.get(row.codigo) !== row.nombre);
    if (ajenos.length > 0) {
      throw new Error('Hay códigos de demostración ocupados por jugadores que no pertenecen al demo; no se modificaron.');
    }
    const ids = rows.map((row) => row.id);
    if (ids.length > 0) {
      await client.query('DELETE FROM public.mediciones WHERE jugador_id = ANY($1::uuid[])', [ids]);
      await client.query('DELETE FROM public.jugadores WHERE id = ANY($1::uuid[])', [ids]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  for (const jugador of demostracion) {
    const creado = await registrarJugador(jugador);
    console.log(`OK ${creado.jugador.codigo}: ${creado.jugador.nombre}`);
  }
} catch (error) {
  console.error('No se pudieron cargar los datos demo.');
  console.error(error instanceof Error ? error.message : 'Error desconocido');
  process.exitCode = 1;
} finally {
  await pool.end();
  await poolAplicacion.end();
}
