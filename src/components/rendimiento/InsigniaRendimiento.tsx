import { Insignia } from '@/components/ui/Insignia';

const etiquetas = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' } as const;

export function InsigniaRendimiento({ rendimiento }: { rendimiento: keyof typeof etiquetas | null }) {
  if (!rendimiento) return <Insignia>Sin medición</Insignia>;
  return <Insignia tono={rendimiento}>{etiquetas[rendimiento]}</Insignia>;
}
