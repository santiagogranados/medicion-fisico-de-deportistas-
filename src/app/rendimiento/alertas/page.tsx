import { PanelAlertas } from '@/components/rendimiento/PanelAlertas';
import { listarAlertas } from '@/lib/dataService';

export default async function AlertasPage() {
  const alertas = await listarAlertas();
  return (
    <section className="rf-seccion">
      <div className="rf-encabezado">
        <div><p className="rf-ceja">SEGUIMIENTO ACADÉMICO</p><h1>Alertas</h1><p className="rf-intro">Revisa mediciones que cruzan los umbrales configurados.</p></div>
      </div>
      <PanelAlertas alertas={alertas} />
    </section>
  );
}
