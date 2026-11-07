import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { ErrorDeNegocio, ESTADO_HTTP, MENSAJES } from '@/lib/reglas/errores';

const NO_STORE = { 'Cache-Control': 'no-store' };

export function responderOk<T>(datos: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, datos }, { status, headers: NO_STORE });
}

function esErrorPostgres(error: unknown): error is { code: string; constraint?: string } {
  return typeof error === 'object' && error !== null && 'code' in error
    && typeof error.code === 'string';
}

function errorDePostgres(error: { code: string; constraint?: string }): ErrorDeNegocio | null {
  if (error.code === '23505' && error.constraint === 'jugadores_codigo_unico') {
    return new ErrorDeNegocio('JUGADOR_DUPLICADO');
  }
  if (error.code === '23503') return new ErrorDeNegocio('TIENE_MEDICIONES');
  if (error.code === '23514') return new ErrorDeNegocio('DATOS_INVALIDOS');
  return null;
}

export function responderError(error: unknown): NextResponse {
  let negocio: ErrorDeNegocio;
  if (error instanceof ErrorDeNegocio) {
    negocio = error;
  } else if (error instanceof ZodError) {
    negocio = new ErrorDeNegocio('DATOS_INVALIDOS', MENSAJES.DATOS_INVALIDOS, error.flatten());
  } else if (esErrorPostgres(error)) {
    const errorTraducido = errorDePostgres(error);
    if (errorTraducido) {
      negocio = errorTraducido;
    } else {
      console.error('Error interno en la API de rendimiento.', {
        codigo: error.code,
        constraint: error.constraint,
      });
      negocio = new ErrorDeNegocio('ERROR_INTERNO');
    }
  } else {
    console.error('Error interno en la API de rendimiento.', error);
    negocio = new ErrorDeNegocio('ERROR_INTERNO');
  }

  return NextResponse.json({
    ok: false,
    error: {
      codigo: negocio.codigo,
      mensaje: negocio.message,
      detalles: negocio.detalles ?? null,
    },
  }, { status: ESTADO_HTTP[negocio.codigo], headers: NO_STORE });
}

type ApiHandler<Args extends unknown[]> = (...args: Args) => Promise<NextResponse>;

export function conManejoDeErrores<Args extends unknown[]>(handler: ApiHandler<Args>): ApiHandler<Args> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return responderError(error);
    }
  };
}

export async function leerCuerpo<T>(request: Request, esquema: ZodType<T>): Promise<T> {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    throw new ErrorDeNegocio('DATOS_INVALIDOS', 'El cuerpo de la solicitud no es JSON válido.');
  }

  return esquema.parse(cuerpo);
}
