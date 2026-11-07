import { describe, expect, it } from 'vitest';
import {
  calcularRendimiento,
  clasificarDistancia,
  clasificarFrecuencia,
  clasificarRecuperacion,
  clasificarVelocidad,
} from './clasificacion';

describe('clasificaciones por umbral', () => {
  it('T-03 clasifica 24.99 km/h como baja', () => expect(clasificarVelocidad(24.99)).toBe('baja'));
  it('T-04 clasifica 25 km/h como media', () => expect(clasificarVelocidad(25)).toBe('media'));
  it('T-05 clasifica 29.99 km/h como media', () => expect(clasificarVelocidad(29.99)).toBe('media'));
  it('T-06 clasifica 30 km/h como alta', () => expect(clasificarVelocidad(30)).toBe('alta'));
  it('T-07 clasifica 4999 m como baja', () => expect(clasificarDistancia(4999)).toBe('baja'));
  it('T-08 clasifica 5000 m como media', () => expect(clasificarDistancia(5000)).toBe('media'));
  it('T-09 clasifica 7999 m como media', () => expect(clasificarDistancia(7999)).toBe('media'));
  it('T-10 clasifica 8000 m como alta', () => expect(clasificarDistancia(8000)).toBe('alta'));
  it('T-11 clasifica 59 s como recuperación rápida', () => expect(clasificarRecuperacion(59)).toBe('rapida'));
  it('T-12 clasifica 60 s como recuperación normal', () => expect(clasificarRecuperacion(60)).toBe('normal'));
  it('T-13 clasifica 120 s como recuperación normal', () => expect(clasificarRecuperacion(120)).toBe('normal'));
  it('T-14 clasifica 120.01 s como recuperación lenta', () => expect(clasificarRecuperacion(120.01)).toBe('lenta'));
  it('T-15 clasifica 159 ppm dentro del rango', () => expect(clasificarFrecuencia(159)).toBe('rango'));
  it('T-16 clasifica 160 ppm como intensidad alta', () => expect(clasificarFrecuencia(160)).toBe('alta'));
  it('T-17 clasifica 180 ppm como intensidad alta', () => expect(clasificarFrecuencia(180)).toBe('alta'));
  it('T-18 clasifica 181 ppm como alerta', () => expect(clasificarFrecuencia(181)).toBe('alerta'));
});

describe('puntaje y rendimiento general', () => {
  it('T-19 puntúa a Carlos con 6 y rendimiento alto', () => {
    expect(calcularRendimiento({ velocidadMaxima: 32.4, distancia: 8200, recuperacion: 55 }))
      .toEqual({ puntaje: 6, rendimiento: 'alto' });
  });

  it('T-20 puntúa a Mateo con 3 y rendimiento medio', () => {
    expect(calcularRendimiento({ velocidadMaxima: 26.4, distancia: 6200, recuperacion: 105 }))
      .toEqual({ puntaje: 3, rendimiento: 'medio' });
  });

  it('T-21 puntúa a Daniel con 2 y rendimiento bajo', () => {
    expect(calcularRendimiento({ velocidadMaxima: 24.1, distancia: 5100, recuperacion: 115 }))
      .toEqual({ puntaje: 2, rendimiento: 'bajo' });
  });

  it('T-22 puntúa velocidad 30, distancia 8000 y recuperación 60 con 5 y rendimiento alto', () => {
    expect(calcularRendimiento({ velocidadMaxima: 30, distancia: 8000, recuperacion: 60 }))
      .toEqual({ puntaje: 5, rendimiento: 'alto' });
  });
});
