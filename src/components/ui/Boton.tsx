import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primario' | 'secundario' | 'peligro' | 'fantasma';
  cargando?: boolean;
};

export function Boton({ variante = 'primario', cargando = false, disabled, children, ...props }: Props) {
  return (
    <button
      {...props}
      className={`rf-boton rf-boton-${variante} ${props.className ?? ''}`.trim()}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
    >
      {cargando ? 'Guardando…' : children}
    </button>
  );
}
