import Link from 'next/link';
import type { JugadorConRendimiento } from '@/lib/datos/tipos';

type Alertas = {
  velocidadBaja: JugadorConRendimiento[];
  recuperacionLenta: JugadorConRendimiento[];
  frecuenciaAlerta: JugadorConRendimiento[];
};

const grupos: { clave: keyof Alertas; titulo: string; detalle: string }[] = [
  { clave: 'velocidadBaja', titulo: 'Velocidad baja', detalle: 'Jugadores cuya medición más reciente está bajo el umbral de velocidad.' },
  { clave: 'recuperacionLenta', titulo: 'Recuperación lenta', detalle: 'Jugadores cuya recuperación más reciente supera el umbral establecido.' },
  { clave: 'frecuenciaAlerta', titulo: 'Frecuencia cardíaca en alerta', detalle: 'Mediciones con frecuencia cardíaca superior al límite del plan.' },
];

export function PanelAlertas({ alertas }: { alertas: Alertas }) {
  return (
    <div className="rf-alertas">
      {grupos.map(({ clave, titulo, detalle }) => (
        <section className="rf-alerta-grupo" key={clave}>
          <div><h2>{titulo}</h2><p className="rf-nota-academica">{detalle}</p></div>
          {alertas[clave].length === 0 ? <p className="rf-alerta-sin-resultados">No hay jugadores en este grupo.</p> : (
            <ul>
              {alertas[clave].map((fila) => (
                <li key={fila.jugador.id}>
                  <Link href={`/rendimiento/jugadores/${fila.jugador.codigo}`}><strong>{fila.jugador.nombre}</strong> · {fila.jugador.posicion}</Link>
                  {fila.medicion && <span>{fila.medicion.fecha} · {fila.medicion.velocidadMaxima.toLocaleString('es-CO')} km/h · {fila.medicion.frecuenciaCardiaca} ppm</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="rf-nota-academica">Estas alertas son indicadores académicos del proyecto; no son diagnósticos ni recomendaciones médicas.</p>
    </div>
  );
}
