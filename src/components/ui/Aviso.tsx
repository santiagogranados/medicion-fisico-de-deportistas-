import type { ReactNode } from 'react';

export function Aviso({
  children,
  tipo = 'info',
  titulo,
}: {
  children: ReactNode;
  tipo?: 'info' | 'exito' | 'advertencia' | 'error';
  titulo?: string;
}) {
  return (
    <aside className={`rf-aviso rf-aviso-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {titulo && <strong>{titulo}</strong>}
      <div>{children}</div>
    </aside>
  );
}
