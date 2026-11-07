import type { NivelFC, NivelRecup, NivelVelDist } from '@/lib/reglas/clasificacion';

export type Jugador = {
  id: string;
  codigo: number;
  nombre: string;
  edad: number;
  posicion: string;
  activo: boolean;
  createdAt: string;
};

export type Medicion = {
  id: number;
  jugadorId: string;
  distancia: number;
  tiempoPrueba: number;
  velocidadMaxima: number;
  velocidadPromedio: number;
  frecuenciaCardiaca: number;
  recuperacion: number;
  sprints: number;
  fecha: string;
};

export type Clasificaciones = {
  velocidad: NivelVelDist;
  distancia: NivelVelDist;
  recuperacion: NivelRecup;
  frecuencia: NivelFC;
};

export type JugadorConRendimiento = {
  jugador: Jugador;
  medicion: Medicion | null;
  clasificaciones: Clasificaciones | null;
  puntaje: number | null;
  rendimiento: 'alto' | 'medio' | 'bajo' | null;
};

export type DatosMedicion = Omit<Medicion, 'id' | 'jugadorId' | 'velocidadPromedio' | 'fecha'>;
export type DatosJugadorConMedicion = Omit<Jugador, 'id' | 'activo' | 'createdAt'> & DatosMedicion;

export type EstadisticasEquipo = {
  promedioVelocidad: number;
  promedioDistancia: number;
  ranking: JugadorConRendimiento[];
};
