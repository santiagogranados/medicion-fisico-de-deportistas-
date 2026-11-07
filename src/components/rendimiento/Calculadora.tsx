'use client';

import { useState } from 'react';
import { Campo } from '@/components/ui/Campo';
import { velocidadPromedioKmh } from '@/lib/reglas/calculos';

export function Calculadora() {
  const [distancia, setDistancia] = useState('');
  const [tiempo, setTiempo] = useState('');
  const distanciaNumero = distancia.trim() ? Number(distancia) : Number.NaN;
  const tiempoNumero = tiempo.trim() ? Number(tiempo) : Number.NaN;
  const valido = Number.isFinite(distanciaNumero) && distanciaNumero > 0
    && Number.isFinite(tiempoNumero) && tiempoNumero > 0;
  const velocidad = valido ? velocidadPromedioKmh(distanciaNumero, tiempoNumero) : null;

  return (
    <section className="rf-calculadora">
      <p className="rf-intro">Ingresa una distancia y un tiempo para calcular la velocidad promedio.</p>
      <div className="rf-form-grid">
        <Campo etiqueta="Distancia (m)" name="distancia" type="number" min="0.01" step="any" value={distancia} onChange={(evento) => setDistancia(evento.target.value)} />
        <Campo etiqueta="Tiempo (s)" name="tiempo" type="number" min="0.01" step="any" value={tiempo} onChange={(evento) => setTiempo(evento.target.value)} />
      </div>
      {velocidad !== null ? (
        <div className="rf-resultado-calculadora" aria-live="polite">
          <p><span>Velocidad promedio</span><strong>{velocidad.toLocaleString('es-CO', { maximumFractionDigits: 2 })} km/h</strong></p>
          <p><span>Equivalencia</span><strong>{(velocidad / 3.6).toLocaleString('es-CO', { maximumFractionDigits: 2 })} m/s</strong></p>
        </div>
      ) : (
        <p className="rf-nota-academica">La distancia y el tiempo deben ser mayores que cero.</p>
      )}
      <p className="rf-nota-academica">Fórmula: (distancia ÷ tiempo) × 3,6. Esta herramienta es académica.</p>
    </section>
  );
}
