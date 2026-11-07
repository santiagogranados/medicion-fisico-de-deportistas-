'use client';

import { Boton } from '@/components/ui/Boton';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RendimientoError({ error, reset }: Props) {
  return (
    <main className="rf-app rf-error-pagina">
      <section className="rf-error-panel" role="alert">
        <p className="rf-ceja">MÓDULO DE RENDIMIENTO</p>
        <h1>No se pudo cargar el módulo</h1>
        <p>
          La aplicación no pudo completar la consulta. Comprueba que <code>MEDIFIS_POSTGRES_URL</code>
          use el pooler de Supabase (puerto 6543), y que las migraciones estén aplicadas.
        </p>
        {error.digest && <p className="rf-error-digest">Referencia: {error.digest}</p>}
        <p className="rf-nota-academica">Puedes verificar la conexión con <code>npm run db:verificar</code>. No se mostraron datos de respaldo porque no se pudo confirmar la persistencia.</p>
        <Boton type="button" onClick={reset}>Reintentar</Boton>
      </section>
    </main>
  );
}
