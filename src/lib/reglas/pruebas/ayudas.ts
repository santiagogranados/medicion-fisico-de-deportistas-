import { expect } from 'vitest';
import { ErrorDeNegocio, type CodigoError } from '../errores';

export function esperarCodigo(fn: () => void, codigo: CodigoError): void {
  try {
    fn();
    expect.fail(`Se esperaba ErrorDeNegocio con código ${codigo}.`);
  } catch (error) {
    expect(error).toBeInstanceOf(ErrorDeNegocio);
    expect((error as ErrorDeNegocio).codigo).toBe(codigo);
  }
}
