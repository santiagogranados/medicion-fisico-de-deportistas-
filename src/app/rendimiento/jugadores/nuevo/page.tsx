import { FormularioJugador } from '@/components/rendimiento/FormularioJugador';

export default function NuevoJugadorPage() {
  return (
    <section className="rf-seccion">
      <div className="rf-encabezado">
        <div>
          <p className="rf-ceja">NUEVO REGISTRO</p>
          <h1>Registrar jugador</h1>
          <p className="rf-intro">Registra sus datos y la medición inicial del equipo.</p>
        </div>
      </div>
      <FormularioJugador />
    </section>
  );
}
