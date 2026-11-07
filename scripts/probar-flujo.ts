import '../scripts/postgres.mjs';
import {
  calcularVelocidad,
  consultarJugador,
  historialMediciones,
  listarAlertas,
  registrarJugador,
  registrarMedicion,
  type CodigoError,
  type DatosJugadorConMedicion,
  type JugadorConRendimiento,
} from '../src/lib/dataService';
import { pool } from '../src/lib/db/conexion';

const prefijo = 'Prueba';
const codigoCarlos = 901;
const codigoDaniel = 902;
const fallas: string[] = [];

function reportar(paso: number, nombre: string, correcto: boolean): void {
  console.log(`${correcto ? 'OK' : 'FALLA'} ${paso}. ${nombre}`);
  if (!correcto) fallas.push(nombre);
}

function esError(error: unknown, codigo: CodigoError): boolean {
  return typeof error === 'object' && error !== null && 'codigo' in error && error.codigo === codigo;
}

async function esperarError(fn: () => Promise<unknown>, codigo: CodigoError): Promise<boolean> {
  try {
    await fn();
  } catch (error) {
    return esError(error, codigo);
  }
  return false;
}

async function eliminarDatosDePrueba(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT id FROM public.jugadores
        WHERE (codigo = $1 AND nombre = $2) OR (codigo = $3 AND nombre = $4)`,
      [codigoCarlos, `${prefijo} Carlos`, codigoDaniel, `${prefijo} Daniel`],
    );
    const ids = rows.map((row: { id: string }) => row.id);
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
}

function datosJugador(codigo: number, nombre: string, datos: Partial<DatosJugadorConMedicion> = {}): DatosJugadorConMedicion {
  return {
    codigo,
    nombre,
    edad: 24,
    posicion: 'Delantero',
    distancia: 8200,
    tiempoPrueba: 4,
    velocidadMaxima: 32.4,
    frecuenciaCardiaca: 175,
    recuperacion: 55,
    sprints: 18,
    ...datos,
  };
}

let carlos: JugadorConRendimiento | null = null;
try {
  await eliminarDatosDePrueba();

  carlos = await registrarJugador(datosJugador(codigoCarlos, `${prefijo} Carlos`));
  reportar(1, 'Carlos obtiene 6/6 y rendimiento alto', carlos.puntaje === 6 && carlos.rendimiento === 'alto');

  reportar(2, 'código duplicado devuelve JUGADOR_DUPLICADO',
    await esperarError(() => registrarJugador(datosJugador(codigoCarlos, `${prefijo} duplicado`)), 'JUGADOR_DUPLICADO'));

  reportar(3, 'edad 14 devuelve DATOS_INVALIDOS',
    await esperarError(() => registrarJugador(datosJugador(903, `${prefijo} edad`, { edad: 14 })), 'DATOS_INVALIDOS'));

  reportar(4, 'distancia 0 devuelve DATOS_INVALIDOS',
    await esperarError(() => registrarJugador(datosJugador(904, `${prefijo} distancia`, { distancia: 0 })), 'DATOS_INVALIDOS'));

  reportar(5, 'FC 230 devuelve DATOS_INVALIDOS',
    await esperarError(() => registrarJugador(datosJugador(905, `${prefijo} FC`, { frecuenciaCardiaca: 230 })), 'DATOS_INVALIDOS'));

  const daniel = await registrarJugador(datosJugador(codigoDaniel, `${prefijo} Daniel`, {
    velocidadMaxima: 24.1,
    distancia: 5100,
    recuperacion: 115,
  }));
  reportar(6, 'Daniel obtiene 2/6 y rendimiento bajo', daniel.puntaje === 2 && daniel.rendimiento === 'bajo');

  const consultadoPorCodigo = await consultarJugador(codigoCarlos);
  reportar(7, 'consulta por código devuelve Carlos', consultadoPorCodigo.jugador.codigo === codigoCarlos);

  const consultadoPorNombre = await consultarJugador(`${prefijo} Daniel`);
  reportar(8, 'consulta por nombre devuelve Daniel', consultadoPorNombre.jugador.codigo === codigoDaniel);

  reportar(9, 'código inexistente devuelve JUGADOR_NO_ENCONTRADO',
    await esperarError(() => consultarJugador(999_999_999), 'JUGADOR_NO_ENCONTRADO'));

  const velocidad = calcularVelocidad(30, 4);
  reportar(10, '30 m / 4 s da 7.5 m/s y 27 km/h', velocidad.ms === 7.5 && velocidad.kmh === 27);

  const nueva = await registrarMedicion(codigoCarlos, {
    distancia: 8300,
    tiempoPrueba: 4,
    velocidadMaxima: 32.5,
    frecuenciaCardiaca: 181,
    recuperacion: 55,
    sprints: 19,
  });
  const historial = await historialMediciones(codigoCarlos);
  reportar(11, 'nueva medición queda al inicio del historial',
    historial.length === 2 && historial[0]?.distancia === 8300 && nueva.medicion?.distancia === 8300);

  const alertas = await listarAlertas();
  reportar(12, 'alertas incluyen velocidad baja de Daniel y FC de alerta de Carlos',
    alertas.velocidadBaja.some((fila) => fila.jugador.codigo === codigoDaniel)
      && alertas.frecuenciaAlerta.some((fila) => fila.jugador.codigo === codigoCarlos));
} catch (error) {
  console.error('No se pudo completar el flujo de base de datos.', error instanceof Error ? error.name : 'Error desconocido');
  fallas.push('error durante el flujo');
} finally {
  try {
    await eliminarDatosDePrueba();
  } catch (error) {
    console.error('No se pudieron limpiar los registros del flujo.', error instanceof Error ? error.name : 'Error desconocido');
    fallas.push('limpieza');
  }
  await pool.end();
  console.log(`Total de fallas: ${fallas.length}`);
  if (fallas.length > 0) process.exitCode = 1;
}
