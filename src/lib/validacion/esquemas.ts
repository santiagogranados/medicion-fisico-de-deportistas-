import { z } from 'zod';

export const esquemaJugador = z.object({
  codigo: z.number().int().min(1).max(2147483647),
  nombre: z.string().trim().min(1).max(120),
  edad: z.number().int(),
  posicion: z.string().trim().min(1).max(40),
});

export const esquemaMedicion = z.object({
  distancia: z.number().int().positive(),
  tiempoPrueba: z.number().positive(),
  velocidadMaxima: z.number().nonnegative(),
  frecuenciaCardiaca: z.number().int(),
  recuperacion: z.number().int().nonnegative(),
  sprints: z.number().int().nonnegative(),
});

export const esquemaJugadorConMedicion = esquemaJugador.extend(esquemaMedicion.shape);

export const esquemaVelocidad = z.object({
  distancia: z.number().positive(),
  tiempo: z.number().positive(),
});

export const esquemaComparar = z.object({
  codigos: z.array(z.number().int()).min(2),
});

export const esquemaFiltros = z.object({
  posicion: z.string().trim().min(1).optional(),
  incluirInactivos: z.enum(['true', 'false']).optional().transform((value) => value === 'true'),
});

export type JugadorInput = z.infer<typeof esquemaJugador>;
export type MedicionInput = z.infer<typeof esquemaMedicion>;
export type JugadorConMedicionInput = z.infer<typeof esquemaJugadorConMedicion>;
export type VelocidadInput = z.infer<typeof esquemaVelocidad>;
export type FiltrosInput = z.infer<typeof esquemaFiltros>;
