import { conManejoDeErrores, leerCuerpo, responderOk } from '@/lib/http/respuestas';
import { exigirSesion } from '@/lib/auth/sesion';
import { calcularVelocidad } from '@/lib/dataService';
import { esquemaVelocidad } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaVelocidad);
  return responderOk(calcularVelocidad(datos.distancia, datos.tiempo));
});
