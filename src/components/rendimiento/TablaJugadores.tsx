import Link from 'next/link';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Selector } from '@/components/ui/Selector';
import { InsigniaNivel } from '@/components/rendimiento/InsigniaNivel';
import { InsigniaRendimiento } from '@/components/rendimiento/InsigniaRendimiento';
import { POSICIONES } from '@/lib/config/rendimiento';
import type { JugadorConRendimiento } from '@/lib/datos/tipos';
import { Campo } from '@/components/ui/Campo';

function velocidad(value: number | undefined): string {
  return value === undefined ? '—' : `${value.toLocaleString('es-CO', { maximumFractionDigits: 2 })} km/h`;
}

export function TablaJugadores({
  jugadores,
  posicion,
  nombre,
}: {
  jugadores: JugadorConRendimiento[];
  posicion: string;
  nombre: string;
}) {
  return (
    <section className="rf-seccion">
      <div className="rf-encabezado">
        <div>
          <p className="rf-ceja">SEGUIMIENTO DEL EQUIPO</p>
          <h1>Jugadores</h1>
          <p className="rf-intro">Consulta la medición más reciente y su clasificación.</p>
        </div>
        <Link className="rf-boton rf-boton-primario" href="/rendimiento/jugadores/nuevo">Registrar jugador</Link>
      </div>
      <form className="rf-filtro" method="get">
        <Campo etiqueta="Buscar por nombre" name="nombre" type="search" value={nombre} maxLength={120} />
        <Selector
          etiqueta="Filtrar por posición"
          name="posicion"
          value={posicion}
          opciones={[
            { valor: '', etiqueta: 'Todas las posiciones' },
            ...POSICIONES.map((item) => ({ valor: item, etiqueta: item })),
          ]}
        />
        <button className="rf-boton rf-boton-secundario" type="submit">Aplicar filtro</button>
        {(posicion || nombre) && <Link className="rf-texto-enlace" href="/rendimiento">Limpiar</Link>}
      </form>

      {jugadores.length === 0 ? (
        <EstadoVacio
          titulo="Aún no hay jugadores"
          detalle={posicion ? 'Prueba otra posición o registra un jugador.' : 'Registra el primer jugador para empezar el seguimiento.'}
        />
      ) : (
        <>
          <div className="rf-tabla-escritorio" role="table" aria-label="Lista de jugadores">
            <div className="rf-fila rf-cabecera-tabla" role="row">
              <span role="columnheader">Jugador</span><span role="columnheader">Posición</span>
              <span role="columnheader">Velocidad máxima</span><span role="columnheader">Distancia</span>
              <span role="columnheader">Recuperación</span><span role="columnheader">Rendimiento</span>
            </div>
            {jugadores.map((fila) => (
              <Link className="rf-fila rf-fila-jugador" role="row" href={`/rendimiento/jugadores/${fila.jugador.codigo}`} key={fila.jugador.id}>
                <span role="cell"><strong>{fila.jugador.nombre}</strong><small>Código {fila.jugador.codigo}</small></span>
                <span role="cell">{fila.jugador.posicion}</span>
                <span role="cell">{velocidad(fila.medicion?.velocidadMaxima)}</span>
                <span role="cell">{fila.medicion ? `${fila.medicion.distancia.toLocaleString('es-CO')} m` : '—'}</span>
                <span role="cell">{fila.clasificaciones ? <InsigniaNivel nivel={fila.clasificaciones.recuperacion} /> : '—'}</span>
                <span role="cell"><InsigniaRendimiento rendimiento={fila.rendimiento} /></span>
              </Link>
            ))}
          </div>
          <div className="rf-tarjetas-jugadores">
            {jugadores.map((fila) => (
              <Link className="rf-tarjeta-jugador" href={`/rendimiento/jugadores/${fila.jugador.codigo}`} key={fila.jugador.id}>
                <span className="rf-tarjeta-jugador-titulo"><strong>{fila.jugador.nombre}</strong><InsigniaRendimiento rendimiento={fila.rendimiento} /></span>
                <span>Código {fila.jugador.codigo} · {fila.jugador.posicion}</span>
                <span>Velocidad: {velocidad(fila.medicion?.velocidadMaxima)}</span>
                <span>Distancia: {fila.medicion ? `${fila.medicion.distancia.toLocaleString('es-CO')} m` : '—'}</span>
                <span>Recuperación: {fila.clasificaciones ? <InsigniaNivel nivel={fila.clasificaciones.recuperacion} /> : '—'}</span>
              </Link>
            ))}
          </div>
        </>
      )}
      <p className="rf-nota-academica">Las clasificaciones son indicadores del proyecto y no diagnósticos médicos.</p>
    </section>
  );
}
