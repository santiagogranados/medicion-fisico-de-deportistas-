import { describe, expect, it } from 'vitest';
import { esperarCodigo } from './pruebas/ayudas';
import { validarJugador } from './jugador';

const jugador = { nombre: 'Santiago', edad: 20, posicion: 'Delantero' };

describe('validarJugador', () => {
  it('T-23 rechaza edad 14', () => {
    esperarCodigo(() => validarJugador({ ...jugador, edad: 14 }), 'DATOS_INVALIDOS');
  });

  it('T-24 rechaza edad 46', () => {
    esperarCodigo(() => validarJugador({ ...jugador, edad: 46 }), 'DATOS_INVALIDOS');
  });

  it('T-25 acepta las edades límite 15 y 45', () => {
    expect(() => validarJugador({ ...jugador, edad: 15 })).not.toThrow();
    expect(() => validarJugador({ ...jugador, edad: 45 })).not.toThrow();
  });

  it('T-26 rechaza un nombre compuesto solo por espacios', () => {
    esperarCodigo(() => validarJugador({ ...jugador, nombre: ' ' }), 'DATOS_INVALIDOS');
  });
});
