import { EDAD_MAX, EDAD_MIN } from '@/lib/config/rendimiento';
import { ErrorDeNegocio } from './errores';

export function validarJugador(d: { nombre: string; edad: number; posicion: string }): void {
  if (typeof d.nombre !== 'string' || d.nombre.trim().length === 0) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  if (!Number.isInteger(d.edad) || d.edad < EDAD_MIN || d.edad > EDAD_MAX) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  if (typeof d.posicion !== 'string' || d.posicion.trim().length === 0) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
}
