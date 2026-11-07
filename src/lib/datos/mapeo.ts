import {
  calcularRendimiento,
  clasificarDistancia,
  clasificarFrecuencia,
  clasificarRecuperacion,
  clasificarVelocidad,
} from '@/lib/reglas/clasificacion';
import type { JugadorConRendimiento, Medicion } from './tipos';

export type FilaJugador = {
  id: string;
  codigo: number;
  nombre: string;
  edad: number;
  posicion: string;
  activo: boolean;
  created_at: string;
  medicion_id: number | null;
  distancia: number | null;
  tiempo_prueba_cent: number | null;
  velocidad_maxima_cent: number | null;
  velocidad_promedio_cent: number | null;
  frecuencia_cardiaca: number | null;
  recuperacion: number | null;
  sprints: number | null;
  fecha: string | null;
};

export function mapearJugador(row: FilaJugador): JugadorConRendimiento {
  const jugador = {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    edad: row.edad,
    posicion: row.posicion,
    activo: row.activo,
    createdAt: row.created_at,
  };

  if (row.medicion_id === null || row.distancia === null || row.tiempo_prueba_cent === null
    || row.velocidad_maxima_cent === null || row.velocidad_promedio_cent === null
    || row.frecuencia_cardiaca === null || row.recuperacion === null || row.sprints === null
    || row.fecha === null) {
    return { jugador, medicion: null, clasificaciones: null, puntaje: null, rendimiento: null };
  }

  const medicion: Medicion = {
    id: row.medicion_id,
    jugadorId: row.id,
    distancia: row.distancia,
    tiempoPrueba: row.tiempo_prueba_cent / 100,
    velocidadMaxima: row.velocidad_maxima_cent / 100,
    velocidadPromedio: row.velocidad_promedio_cent / 100,
    frecuenciaCardiaca: row.frecuencia_cardiaca,
    recuperacion: row.recuperacion,
    sprints: row.sprints,
    fecha: row.fecha,
  };
  const clasificaciones = {
    velocidad: clasificarVelocidad(medicion.velocidadMaxima),
    distancia: clasificarDistancia(medicion.distancia),
    recuperacion: clasificarRecuperacion(medicion.recuperacion),
    frecuencia: clasificarFrecuencia(medicion.frecuenciaCardiaca),
  };
  const { puntaje, rendimiento } = calcularRendimiento({
    velocidadMaxima: medicion.velocidadMaxima,
    distancia: medicion.distancia,
    recuperacion: medicion.recuperacion,
  });

  return { jugador, medicion, clasificaciones, puntaje, rendimiento };
}
