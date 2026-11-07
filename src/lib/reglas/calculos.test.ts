import { describe, expect, it } from 'vitest';
import { velocidadPromedioKmh } from './calculos';

describe('velocidadPromedioKmh', () => {
  it('T-01 calcula 27 km/h para 30 m en 4 s', () => {
    expect(velocidadPromedioKmh(30, 4)).toBe(27);
  });

  it('T-02 calcula 36 km/h para 100 m en 10 s', () => {
    expect(velocidadPromedioKmh(100, 10)).toBe(36);
  });
});
