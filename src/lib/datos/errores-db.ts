import { ErrorDeNegocio } from '@/lib/reglas/errores';

export function traducirErrorBaseDatos(error: unknown): Error {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return error instanceof Error ? error : new Error('Error desconocido de base de datos.');
  }
  const codigo = error.code;
  const constraint = 'constraint' in error && typeof error.constraint === 'string' ? error.constraint : '';
  if (codigo === '23505' && constraint === 'jugadores_codigo_unico') {
    return new ErrorDeNegocio('JUGADOR_DUPLICADO');
  }
  if (codigo === '23503') return new ErrorDeNegocio('TIENE_MEDICIONES');
  if (codigo === '23514') return new ErrorDeNegocio('DATOS_INVALIDOS');
  return error instanceof Error ? error : new Error('Error desconocido de base de datos.');
}
