export { obtenerSesion } from '@/lib/auth/sesion';
export {
  consultarJugador,
  desactivarJugador,
  listarJugadores,
  registrarJugador,
} from './datos/jugadores';
export {
  historialMediciones,
  registrarMedicion,
} from './datos/mediciones';
export type {
  Clasificaciones,
  DatosJugadorConMedicion,
  DatosMedicion,
  EstadisticasEquipo,
  Jugador,
  JugadorConRendimiento,
  Medicion,
} from './datos/tipos';
export { ErrorDeNegocio, type CodigoError } from './reglas/errores';

import { listarJugadores } from './datos/jugadores';
import { velocidadPromedioKmh } from './reglas/calculos';
import { ErrorDeNegocio } from './reglas/errores';

export function calcularVelocidad(distancia: number, tiempo: number): { ms: number; kmh: number } {
  if (!Number.isFinite(distancia) || distancia <= 0 || !Number.isFinite(tiempo) || tiempo <= 0) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  return { ms: distancia / tiempo, kmh: velocidadPromedioKmh(distancia, tiempo) };
}

export async function listarAlertas(): Promise<{
  velocidadBaja: import('./datos/tipos').JugadorConRendimiento[];
  recuperacionLenta: import('./datos/tipos').JugadorConRendimiento[];
  frecuenciaAlerta: import('./datos/tipos').JugadorConRendimiento[];
}> {
  const jugadores = await listarJugadores();
  return {
    velocidadBaja: jugadores.filter((fila) => fila.clasificaciones?.velocidad === 'baja'),
    recuperacionLenta: jugadores.filter((fila) => fila.clasificaciones?.recuperacion === 'lenta'),
    frecuenciaAlerta: jugadores.filter((fila) => fila.clasificaciones?.frecuencia === 'alerta'),
  };
}
