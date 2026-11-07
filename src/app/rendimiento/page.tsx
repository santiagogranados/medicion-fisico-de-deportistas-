import { TablaJugadores } from '@/components/rendimiento/TablaJugadores';
import { POSICIONES } from '@/lib/config/rendimiento';
import { consultarJugador, listarJugadores } from '@/lib/dataService';
import type { JugadorConRendimiento } from '@/lib/datos/tipos';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

type PageProps = { searchParams: Promise<{ posicion?: string; nombre?: string }> };

export default async function RendimientoPage({ searchParams }: PageProps) {
  const { posicion: filtro, nombre: busqueda } = await searchParams;
  const posicion = filtro && POSICIONES.some((item) => item === filtro) ? filtro : '';
  const nombre = busqueda?.trim().slice(0, 120) ?? '';
  let jugadores: JugadorConRendimiento[];
  if (nombre) {
    try {
      const jugador = await consultarJugador(nombre);
      jugadores = !posicion || jugador.jugador.posicion === posicion ? [jugador] : [];
    } catch (error) {
      if (!(error instanceof ErrorDeNegocio) || error.codigo !== 'JUGADOR_NO_ENCONTRADO') throw error;
      jugadores = [];
    }
  } else {
    jugadores = await listarJugadores(posicion ? { posicion } : {});
  }
  return <TablaJugadores jugadores={jugadores} posicion={posicion} nombre={nombre} />;
}
