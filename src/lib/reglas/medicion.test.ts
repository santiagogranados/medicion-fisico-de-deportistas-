import { describe, expect, it } from 'vitest';
import { esperarCodigo } from './pruebas/ayudas';
import { validarMedicion } from './medicion';

const medicion = {
  distancia: 8200,
  tiempoPrueba: 4,
  velocidadMaxima: 32.4,
  frecuenciaCardiaca: 175,
  recuperacion: 55,
  sprints: 18,
};

describe('validarMedicion', () => {
  it('T-27 rechaza distancia 0', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, distancia: 0 }), 'DATOS_INVALIDOS');
  });

  it('T-28 rechaza tiempo de prueba 0', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, tiempoPrueba: 0 }), 'DATOS_INVALIDOS');
  });

  it('rechaza distancia que no esté expresada en metros enteros', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, distancia: 10.5 }), 'DATOS_INVALIDOS');
  });

  it('rechaza tiempos con más precisión que centésimas', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, tiempoPrueba: 4.001 }), 'DATOS_INVALIDOS');
  });

  it('T-29 rechaza velocidad máxima negativa', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, velocidadMaxima: -1 }), 'DATOS_INVALIDOS');
  });

  it('rechaza velocidades máximas con más precisión que centésimas', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, velocidadMaxima: 32.401 }), 'DATOS_INVALIDOS');
  });

  it('T-30 rechaza FC 39', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, frecuenciaCardiaca: 39 }), 'DATOS_INVALIDOS');
  });

  it('T-31 rechaza FC 221', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, frecuenciaCardiaca: 221 }), 'DATOS_INVALIDOS');
  });

  it('T-32 rechaza sprints negativos', () => {
    esperarCodigo(() => validarMedicion({ ...medicion, sprints: -1 }), 'DATOS_INVALIDOS');
  });

  it('T-33 acepta FC en ambos límites, 40 y 220', () => {
    expect(() => validarMedicion({ ...medicion, frecuenciaCardiaca: 40 })).not.toThrow();
    expect(() => validarMedicion({ ...medicion, frecuenciaCardiaca: 220 })).not.toThrow();
  });
});
