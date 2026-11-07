export function velocidadPromedioKmh(distanciaM: number, tiempoS: number): number {
  return Math.round((distanciaM / tiempoS) * 3.6 * 100) / 100;
}
