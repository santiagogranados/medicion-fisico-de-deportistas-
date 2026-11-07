import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enviarCorreo } from '@/lib/correo';

const esquemaPrueba = z.object({
  para: z.string().trim().email('Escribe un correo electrónico válido.'),
});

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'No encontrado.' }, { status: 404 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'El cuerpo de la solicitud no es JSON válido.' }, { status: 400 });
  }

  const resultadoValidacion = esquemaPrueba.safeParse(cuerpo);
  if (!resultadoValidacion.success) {
    return NextResponse.json({
      success: false,
      error: resultadoValidacion.error.issues[0]?.message ?? 'Escribe un correo electrónico válido.',
    }, { status: 400 });
  }

  const resultado = await enviarCorreo({
    para: resultadoValidacion.data.para,
    asunto: 'Prueba de correo',
    html: '<p>Este es un correo de prueba de Medifis.</p>',
  });

  if (!resultado.ok) {
    return NextResponse.json({ success: false, error: resultado.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: resultado.id });
}
