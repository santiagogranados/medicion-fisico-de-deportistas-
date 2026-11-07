import { conTransaccion, consultar, type PoolClient } from '@/lib/db/conexion';
import { velocidadPromedioKmh } from '@/lib/reglas/calculos';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { hoyBogota } from '@/lib/reglas/fechas';
import { validarMedicion } from '@/lib/reglas/medicion';
import { mapearJugador, type FilaJugador } from './mapeo';
import { traducirErrorBaseDatos } from './errores-db';
import type { DatosMedicion, JugadorConRendimiento, Medicion } from './tipos';

const SELECT_JUGADOR = `
  SELECT id, codigo, nombre, edad, posicion, activo, created_at,
         medicion_id, distancia, tiempo_prueba_cent, velocidad_maxima_cent,
         velocidad_promedio_cent, frecuencia_cardiaca, recuperacion, sprints, fecha
    FROM public.v_jugadores
`;

async function leerPorCodigo(tx: PoolClient, codigo: number): Promise<JugadorConRendimiento> {
  const { rows } = await tx.query<FilaJugador>(`${SELECT_JUGADOR} WHERE codigo = $1`, [codigo]);
  const row = rows[0];
  if (!row) throw new ErrorDeNegocio('JUGADOR_NO_ENCONTRADO');
  return mapearJugador(row);
}

export async function registrarMedicion(codigo: number, d: DatosMedicion): Promise<JugadorConRendimiento> {
  validarMedicion(d);
  try {
    return await conTransaccion(async (tx) => {
      const { rows } = await tx.query<{ id: string }>(
        'SELECT id FROM public.jugadores WHERE codigo = $1',
        [codigo],
      );
      const jugadorId = rows[0]?.id;
      if (!jugadorId) throw new ErrorDeNegocio('JUGADOR_NO_ENCONTRADO');
      const velocidadPromedio = velocidadPromedioKmh(d.distancia, d.tiempoPrueba);
      await tx.query(
        `INSERT INTO public.mediciones
          (jugador_id, distancia, tiempo_prueba_cent, velocidad_maxima_cent,
           velocidad_promedio_cent, frecuencia_cardiaca, recuperacion, sprints, fecha)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          jugadorId,
          d.distancia,
          Math.round(d.tiempoPrueba * 100),
          Math.round(d.velocidadMaxima * 100),
          Math.round(velocidadPromedio * 100),
          d.frecuenciaCardiaca,
          d.recuperacion,
          d.sprints,
          hoyBogota(),
        ],
      );
      return leerPorCodigo(tx, codigo);
    });
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}

export async function historialMediciones(codigo: number): Promise<Medicion[]> {
  const rows = await consultar<{
    id: number;
    jugador_id: string;
    distancia: number;
    tiempo_prueba_cent: number;
    velocidad_maxima_cent: number;
    velocidad_promedio_cent: number;
    frecuencia_cardiaca: number;
    recuperacion: number;
    sprints: number;
    fecha: string;
  }>(
    `SELECT m.id, m.jugador_id, m.distancia, m.tiempo_prueba_cent,
            m.velocidad_maxima_cent, m.velocidad_promedio_cent,
            m.frecuencia_cardiaca, m.recuperacion, m.sprints, m.fecha
       FROM public.mediciones m
       JOIN public.jugadores j ON j.id = m.jugador_id
      WHERE j.codigo = $1
      ORDER BY m.fecha DESC, m.id DESC`,
    [codigo],
  );
  if (rows.length === 0) {
    const exists = await consultar<{ existe: boolean }>(
      'SELECT EXISTS (SELECT 1 FROM public.jugadores WHERE codigo = $1) AS existe',
      [codigo],
    );
    if (!exists[0]?.existe) throw new ErrorDeNegocio('JUGADOR_NO_ENCONTRADO');
  }
  return rows.map((row) => ({
    id: row.id,
    jugadorId: row.jugador_id,
    distancia: row.distancia,
    tiempoPrueba: row.tiempo_prueba_cent / 100,
    velocidadMaxima: row.velocidad_maxima_cent / 100,
    velocidadPromedio: row.velocidad_promedio_cent / 100,
    frecuenciaCardiaca: row.frecuencia_cardiaca,
    recuperacion: row.recuperacion,
    sprints: row.sprints,
    fecha: row.fecha,
  }));
}
