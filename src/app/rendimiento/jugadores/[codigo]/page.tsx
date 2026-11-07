import { notFound } from 'next/navigation';
import { FichaJugador } from '@/components/rendimiento/FichaJugador';
import { consultarJugador, historialMediciones } from '@/lib/dataService';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

type PageProps = { params: Promise<{ codigo: string }> };

export default async function FichaJugadorPage({ params }: PageProps) {
  const { codigo } = await params;
  let datos;
  try {
    datos = await consultarJugador(codigo);
  } catch (error) {
    if (error instanceof ErrorDeNegocio && error.codigo === 'JUGADOR_NO_ENCONTRADO') notFound();
    throw error;
  }
  const historial = await historialMediciones(datos.jugador.codigo);
  return <FichaJugador datos={datos} historial={historial} />;
}
