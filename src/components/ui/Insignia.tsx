import type { ReactNode } from 'react';

export type TonoInsignia = 'neutro' | 'alto' | 'medio' | 'bajo';

export function Insignia({ children, tono = 'neutro' }: { children: ReactNode; tono?: TonoInsignia }) {
  return <span className={`rf-insignia rf-insignia-${tono}`}>{children}</span>;
}
