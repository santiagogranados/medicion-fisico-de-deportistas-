import { getToken } from '@vercel/connect';
import { Resend } from 'resend';

type Correo = {
  para: string;
  asunto: string;
  html: string;
};

type ResultadoEnvio =
  | { ok: true; id: string }
  | { ok: false; error: string };

const identificadorConector = 'resend/medicion-fisico-de-deportistas';

export async function obtenerClaveResend(): Promise<string> {
  const claveConfigurada = process.env.RESEND_API_KEY?.trim();
  if (claveConfigurada) return claveConfigurada;

  return getToken(identificadorConector, { subject: { type: 'app' } });
}

export async function enviarCorreo({ para, asunto, html }: Correo): Promise<ResultadoEnvio> {
  try {
    const clave = await obtenerClaveResend();
    const resend = new Resend(clave);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM?.trim() || 'onboarding@resend.dev',
      to: para,
      subject: asunto,
      html,
    });

    if (error) return { ok: false, error: error.message || 'Resend no pudo enviar el correo.' };
    if (!data?.id) return { ok: false, error: 'Resend no devolvió la confirmación del correo.' };

    return { ok: true, id: data.id };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido al enviar el correo.';
    return { ok: false, error: `No se pudo enviar el correo: ${mensaje}` };
  }
}
