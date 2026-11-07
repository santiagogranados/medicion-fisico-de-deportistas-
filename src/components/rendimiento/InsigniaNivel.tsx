import { Insignia, type TonoInsignia } from '@/components/ui/Insignia';
import type { NivelRecup, NivelVelDist } from '@/lib/reglas/clasificacion';

type Nivel = NivelVelDist | NivelRecup | 'rango' | 'alerta';

const etiquetas: Record<Nivel, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  rapida: 'Rápida',
  normal: 'Normal',
  lenta: 'Lenta',
  rango: 'Dentro del rango',
  alerta: 'Alerta',
};

const tonos: Record<Nivel, TonoInsignia> = {
  baja: 'bajo',
  media: 'medio',
  alta: 'alto',
  rapida: 'alto',
  normal: 'medio',
  lenta: 'bajo',
  rango: 'alto',
  alerta: 'bajo',
};

export function InsigniaNivel({ nivel }: { nivel: Nivel }) {
  return <Insignia tono={tonos[nivel]}>{etiquetas[nivel]}</Insignia>;
}
