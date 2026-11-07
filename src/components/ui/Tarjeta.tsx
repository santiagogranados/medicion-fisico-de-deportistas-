import type { HTMLAttributes } from 'react';

export function Tarjeta({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`rf-tarjeta ${className}`.trim()} />;
}
