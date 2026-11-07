import { conManejoDeErrores, responderOk } from '@/lib/http/respuestas';
import { exigirSesion } from '@/lib/auth/sesion';
import { consultarJugador } from '@/lib/dataService';

type RouteContext = { params: Promise<{ codigo: string }> };

export const dynamic = 'force-dynamic';

export const GET = conManejoDeErrores(async (_request: Request, context: RouteContext) => {
  await exigirSesion();
  const { codigo } = await context.params;
  const jugador = await consultarJugador(codigo);
  return responderOk(jugador);
});
