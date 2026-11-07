import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  error?: string;
  ayuda?: ReactNode;
};

export function Campo({ etiqueta, error, ayuda, id, ...props }: Props) {
  const fieldId = id ?? props.name;
  const errorId = error && fieldId ? `${fieldId}-error` : undefined;
  return (
    <label className="rf-campo" htmlFor={fieldId}>
      <span>{etiqueta}</span>
      <input {...props} id={fieldId} aria-invalid={Boolean(error)} aria-describedby={errorId} />
      {ayuda && <small>{ayuda}</small>}
      {error && <small className="rf-error" id={errorId}>{error}</small>}
    </label>
  );
}
