import { conManejoDeErrores, leerCuerpo, responderOk } from '@/lib/http/respuestas';
import { exigirSesion } from '@/lib/auth/sesion';
import { listarJugadores, registrarJugador } from '@/lib/dataService';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import {
  esquemaFiltros,
  esquemaJugadorConMedicion,
} from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

export const GET = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const url = new URL(request.url);
  const filtros = esquemaFiltros.parse({
    posicion: url.searchParams.get('posicion') ?? undefined,
    incluirInactivos: url.searchParams.get('incluirInactivos') ?? undefined,
  });
  if (filtros.incluirInactivos && url.searchParams.get('incluirInactivos') !== 'true') {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  const opciones = {
    ...(filtros.posicion ? { posicion: filtros.posicion } : {}),
    ...(filtros.incluirInactivos ? { incluirInactivos: true } : {}),
  };
  const jugadores = await listarJugadores(opciones);
  return responderOk(jugadores);
});

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaJugadorConMedicion);
  const jugador = await registrarJugador(datos);
  return responderOk(jugador, 201);
});
