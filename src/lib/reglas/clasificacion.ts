import {
  DIST_ALTA_M,
  DIST_MEDIA_M,
  FC_ALERTA_MAX,
  FC_INTENSA,
  RECUP_NORMAL_MAX_S,
  RECUP_RAPIDA_S,
  VEL_ALTA_KMH,
  VEL_MEDIA_KMH,
} from '@/lib/config/rendimiento';

export type NivelVelDist = 'baja' | 'media' | 'alta';
export type NivelRecup = 'rapida' | 'normal' | 'lenta';
export type NivelFC = 'rango' | 'alta' | 'alerta';

export function clasificarVelocidad(kmh: number): NivelVelDist {
  const centesimas = Math.round(kmh * 100);
  if (centesimas < VEL_MEDIA_KMH * 100) return 'baja';
  if (centesimas < VEL_ALTA_KMH * 100) return 'media';
  return 'alta';
}

export function clasificarDistancia(metros: number): NivelVelDist {
  if (metros < DIST_MEDIA_M) return 'baja';
  if (metros < DIST_ALTA_M) return 'media';
  return 'alta';
}

export function clasificarRecuperacion(segundos: number): NivelRecup {
  if (segundos < RECUP_RAPIDA_S) return 'rapida';
  if (segundos <= RECUP_NORMAL_MAX_S) return 'normal';
  return 'lenta';
}

export function clasificarFrecuencia(ppm: number): NivelFC {
  if (ppm < FC_INTENSA) return 'rango';
  if (ppm <= FC_ALERTA_MAX) return 'alta';
  return 'alerta';
}

const PUNTOS_VD: Record<NivelVelDist, number> = { alta: 2, media: 1, baja: 0 };
const PUNTOS_RECUPERACION: Record<NivelRecup, number> = { rapida: 2, normal: 1, lenta: 0 };

export function calcularRendimiento(d: {
  velocidadMaxima: number;
  distancia: number;
  recuperacion: number;
}): { puntaje: number; rendimiento: 'alto' | 'medio' | 'bajo' } {
  const puntaje =
    PUNTOS_VD[clasificarVelocidad(d.velocidadMaxima)] +
    PUNTOS_VD[clasificarDistancia(d.distancia)] +
    PUNTOS_RECUPERACION[clasificarRecuperacion(d.recuperacion)];
  const rendimiento = puntaje >= 5 ? 'alto' : puntaje >= 3 ? 'medio' : 'bajo';
  return { puntaje, rendimiento };
}
