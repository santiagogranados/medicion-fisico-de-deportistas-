import { Calculadora } from '@/components/rendimiento/Calculadora';

export default function CalculadoraPage() {
  return (
    <section className="rf-seccion">
      <div className="rf-encabezado">
        <div>
          <p className="rf-ceja">HERRAMIENTA</p>
          <h1>Calculadora de velocidad</h1>
        </div>
      </div>
      <Calculadora />
    </section>
  );
}
