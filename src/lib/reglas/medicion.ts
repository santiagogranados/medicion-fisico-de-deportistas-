import { FC_MAX, FC_MIN } from '@/lib/config/rendimiento';
import { ErrorDeNegocio } from './errores';

export type DatosValidacionMedicion = {
  distancia: number;
  tiempoPrueba: number;
  velocidadMaxima: number;
  frecuenciaCardiaca: number;
  recuperacion: number;
  sprints: number;
};

function tieneMaximoDosDecimales(valor: number): boolean {
  return Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-8;
}

export function validarMedicion(d: DatosValidacionMedicion): void {
  if (!Number.isInteger(d.distancia) || d.distancia <= 0) throw new ErrorDeNegocio('DATOS_INVALIDOS');
  if (!Number.isFinite(d.tiempoPrueba) || d.tiempoPrueba <= 0 || !tieneMaximoDosDecimales(d.tiempoPrueba)) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  if (!Number.isFinite(d.velocidadMaxima) || d.velocidadMaxima < 0 || !tieneMaximoDosDecimales(d.velocidadMaxima)) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  if (!Number.isInteger(d.frecuenciaCardiaca) || d.frecuenciaCardiaca < FC_MIN || d.frecuenciaCardiaca > FC_MAX) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  if (!Number.isInteger(d.recuperacion) || d.recuperacion < 0) throw new ErrorDeNegocio('DATOS_INVALIDOS');
  if (!Number.isInteger(d.sprints) || d.sprints < 0) throw new ErrorDeNegocio('DATOS_INVALIDOS');
}
