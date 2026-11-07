import { conTransaccion, consultar, type PoolClient } from '@/lib/db/conexion';
import { velocidadPromedioKmh } from '@/lib/reglas/calculos';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { hoyBogota } from '@/lib/reglas/fechas';
import { validarJugador } from '@/lib/reglas/jugador';
import { validarMedicion } from '@/lib/reglas/medicion';
import { LIMITE_LISTADO } from '@/lib/config/rendimiento';
import type { FilaJugador } from './mapeo';
import { mapearJugador } from './mapeo';
import { traducirErrorBaseDatos } from './errores-db';
import type { DatosJugadorConMedicion, JugadorConRendimiento } from './tipos';

const SELECT_JUGADOR = `
  SELECT id, codigo, nombre, edad, posicion, activo, created_at,
         medicion_id, distancia, tiempo_prueba_cent, velocidad_maxima_cent,
         velocidad_promedio_cent, frecuencia_cardiaca, recuperacion, sprints, fecha
    FROM public.v_jugadores
`;

async function leerPorId(tx: PoolClient, id: string): Promise<JugadorConRendimiento> {
  const { rows } = await tx.query<FilaJugador>(`${SELECT_JUGADOR} WHERE id = $1`, [id]);
  const row = rows[0];
  if (!row) throw new ErrorDeNegocio('JUGADOR_NO_ENCONTRADO');
  return mapearJugador(row);
}

export async function listarJugadores(filtros: {
  posicion?: string;
  incluirInactivos?: boolean;
} = {}): Promise<JugadorConRendimiento[]> {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  if (!filtros.incluirInactivos) condiciones.push('activo = true');
  if (filtros.posicion) {
    valores.push(filtros.posicion);
    condiciones.push(`posicion = $${valores.length}`);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  valores.push(LIMITE_LISTADO);
  const rows = await consultar<FilaJugador>(
    `${SELECT_JUGADOR} ${where} ORDER BY nombre ASC, codigo ASC LIMIT $${valores.length}`,
    valores,
  );
  return rows.map(mapearJugador);
}

export async function registrarJugador(d: DatosJugadorConMedicion): Promise<JugadorConRendimiento> {
  validarJugador(d);
  validarMedicion(d);

  try {
    return await conTransaccion(async (tx) => {
      const { rows } = await tx.query<{ id: string }>(
        `INSERT INTO public.jugadores (codigo, nombre, edad, posicion)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [d.codigo, d.nombre.trim(), d.edad, d.posicion.trim()],
      );
      const jugadorId = rows[0]?.id;
      if (!jugadorId) throw new Error('La base no devolvió el identificador del jugador.');
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
      return leerPorId(tx, jugadorId);
    });
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}

export async function consultarJugador(codigoONombre: string | number): Promise<JugadorConRendimiento> {
  const esCodigo = typeof codigoONombre === 'number'
    || (typeof codigoONombre === 'string' && /^\d+$/.test(codigoONombre.trim()));
  const valor = typeof codigoONombre === 'number' ? codigoONombre : codigoONombre.trim();
  const condicion = esCodigo ? 'codigo = $1' : 'lower(nombre) = lower($1)';
  const rows = await consultar<FilaJugador>(
    `${SELECT_JUGADOR} WHERE ${condicion} ORDER BY codigo ASC LIMIT 1`,
    [valor],
  );
  const row = rows[0];
  if (!row) throw new ErrorDeNegocio('JUGADOR_NO_ENCONTRADO');
  return mapearJugador(row);
}

export async function desactivarJugador(codigo: number): Promise<void> {
  const rows = await consultar<{ codigo: number }>(
    `UPDATE public.jugadores SET activo = false WHERE codigo = $1 RETURNING codigo`,
    [codigo],
  );
  if (rows.length === 0) throw new ErrorDeNegocio('JUGADOR_NO_ENCONTRADO');
}
