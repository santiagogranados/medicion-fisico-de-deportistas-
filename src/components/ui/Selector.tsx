import type { SelectHTMLAttributes } from 'react';

export type OpcionSelector = { valor: string; etiqueta: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  etiqueta: string;
  opciones: OpcionSelector[];
  error?: string;
};

export function Selector({ etiqueta, opciones, error, id, ...props }: Props) {
  const fieldId = id ?? props.name;
  const errorId = error && fieldId ? `${fieldId}-error` : undefined;
  return (
    <label className="rf-campo" htmlFor={fieldId}>
      <span>{etiqueta}</span>
      <select {...props} id={fieldId} aria-invalid={Boolean(error)} aria-describedby={errorId}>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
        ))}
      </select>
      {error && <small className="rf-error" id={errorId}>{error}</small>}
    </label>
  );
}
