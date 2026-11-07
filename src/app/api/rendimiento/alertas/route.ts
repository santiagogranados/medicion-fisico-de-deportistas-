import { conManejoDeErrores, responderOk } from '@/lib/http/respuestas';
import { exigirSesion } from '@/lib/auth/sesion';
import { listarAlertas } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export const GET = conManejoDeErrores(async () => {
  await exigirSesion();
  return responderOk(await listarAlertas());
});
