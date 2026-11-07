import { conManejoDeErrores, leerCuerpo, responderOk } from '@/lib/http/respuestas';
import { exigirSesion } from '@/lib/auth/sesion';
import { historialMediciones, registrarMedicion } from '@/lib/dataService';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { esquemaMedicion } from '@/lib/validacion/esquemas';

type RouteContext = { params: Promise<{ codigo: string }> };

export const dynamic = 'force-dynamic';

function codigoNumerico(codigo: string): number {
  const numero = Number(codigo);
  if (!Number.isSafeInteger(numero) || numero < 1) throw new ErrorDeNegocio('DATOS_INVALIDOS');
  return numero;
}

export const GET = conManejoDeErrores(async (_request: Request, context: RouteContext) => {
  await exigirSesion();
  const { codigo } = await context.params;
  const mediciones = await historialMediciones(codigoNumerico(codigo));
  return responderOk(mediciones);
});

export const POST = conManejoDeErrores(async (request: Request, context: RouteContext) => {
  await exigirSesion();
  const { codigo } = await context.params;
  const datos = await leerCuerpo(request, esquemaMedicion);
  const jugador = await registrarMedicion(codigoNumerico(codigo), datos);
  return responderOk(jugador, 201);
});
