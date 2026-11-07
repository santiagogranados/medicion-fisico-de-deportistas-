'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import { InsigniaNivel } from '@/components/rendimiento/InsigniaNivel';
import { InsigniaRendimiento } from '@/components/rendimiento/InsigniaRendimiento';
import { FC_MAX, FC_MIN } from '@/lib/config/rendimiento';
import { calcularRendimiento, clasificarDistancia, clasificarFrecuencia, clasificarRecuperacion, clasificarVelocidad } from '@/lib/reglas/clasificacion';
import { velocidadPromedioKmh } from '@/lib/reglas/calculos';
import { validarMedicion } from '@/lib/reglas/medicion';

type Valores = {
  distancia: string;
  tiempoPrueba: string;
  velocidadMaxima: string;
  frecuenciaCardiaca: string;
  recuperacion: string;
  sprints: string;
};

function aNumero(valor: string): number {
  return valor.trim() === '' ? Number.NaN : Number(valor);
}

export function FormularioMedicion({ codigo, alCancelar }: { codigo: number; alCancelar: () => void }) {
  const router = useRouter();
  const [valores, setValores] = useState<Valores>({
    distancia: '',
    tiempoPrueba: '',
    velocidadMaxima: '',
    frecuenciaCardiaca: '',
    recuperacion: '',
    sprints: '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const medicion = {
    distancia: aNumero(valores.distancia),
    tiempoPrueba: aNumero(valores.tiempoPrueba),
    velocidadMaxima: aNumero(valores.velocidadMaxima),
    frecuenciaCardiaca: aNumero(valores.frecuenciaCardiaca),
    recuperacion: aNumero(valores.recuperacion),
    sprints: aNumero(valores.sprints),
  };
  const valida = Number.isInteger(medicion.distancia) && medicion.distancia > 0
    && Number.isFinite(medicion.tiempoPrueba) && medicion.tiempoPrueba > 0 && Math.abs(medicion.tiempoPrueba * 100 - Math.round(medicion.tiempoPrueba * 100)) < 1e-8
    && Number.isFinite(medicion.velocidadMaxima) && medicion.velocidadMaxima >= 0 && Math.abs(medicion.velocidadMaxima * 100 - Math.round(medicion.velocidadMaxima * 100)) < 1e-8
    && Number.isInteger(medicion.frecuenciaCardiaca) && medicion.frecuenciaCardiaca >= FC_MIN && medicion.frecuenciaCardiaca <= FC_MAX
    && Number.isInteger(medicion.recuperacion) && medicion.recuperacion >= 0
    && Number.isInteger(medicion.sprints) && medicion.sprints >= 0;
  const promedio = valida ? velocidadPromedioKmh(medicion.distancia, medicion.tiempoPrueba) : null;
  const rendimiento = valida ? calcularRendimiento(medicion) : null;

  function actualizar(campo: keyof Valores, valor: string) {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setError('');
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!valida) return;
    try {
      validarMedicion(medicion);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'Revisa los valores de la medición.');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      const response = await fetch(`/api/rendimiento/jugadores/${codigo}/mediciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicion),
      });
      const resultado: unknown = await response.json();
      if (!response.ok || typeof resultado !== 'object' || resultado === null || !('ok' in resultado) || resultado.ok !== true) {
        const mensaje = typeof resultado === 'object' && resultado !== null && 'error' in resultado
          && typeof resultado.error === 'object' && resultado.error !== null && 'mensaje' in resultado.error
          && typeof resultado.error.mensaje === 'string'
          ? resultado.error.mensaje
          : 'No fue posible registrar la medición.';
        throw new Error(mensaje);
      }
      alCancelar();
      router.refresh();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No fue posible registrar la medición.');
    } finally {
      setGuardando(false);
    }
  }

  const definiciones: { campo: keyof Valores; etiqueta: string; minimo: string; paso: string }[] = [
    { campo: 'distancia', etiqueta: 'Distancia (m)', minimo: '1', paso: '1' },
    { campo: 'tiempoPrueba', etiqueta: 'Tiempo de prueba (s)', minimo: '0.01', paso: '0.01' },
    { campo: 'velocidadMaxima', etiqueta: 'Velocidad máxima (km/h)', minimo: '0', paso: '0.01' },
    { campo: 'frecuenciaCardiaca', etiqueta: 'Frecuencia cardíaca (ppm)', minimo: String(FC_MIN), paso: '1' },
    { campo: 'recuperacion', etiqueta: 'Recuperación (s)', minimo: '0', paso: '1' },
    { campo: 'sprints', etiqueta: 'Sprints', minimo: '0', paso: '1' },
  ];

  return (
    <form className="rf-formulario rf-formulario-medicion" onSubmit={guardar} noValidate>
      <h2>Nueva medición</h2>
      <div className="rf-form-grid">
        {definiciones.map(({ campo, etiqueta, minimo, paso }) => (
          <Campo
            key={campo}
            etiqueta={etiqueta}
            name={campo}
            type="number"
            min={minimo}
            max={campo === 'frecuenciaCardiaca' ? String(FC_MAX) : undefined}
            step={paso}
            value={valores[campo]}
            onChange={(evento) => actualizar(campo, evento.target.value)}
            required
          />
        ))}
      </div>
      {valida && promedio !== null && rendimiento && (
        <div className="rf-vista-previa" aria-live="polite">
          <p>Velocidad promedio: <strong>{promedio.toLocaleString('es-CO', { maximumFractionDigits: 2 })} km/h</strong></p>
          <div className="rf-vista-insignias">
            <span>Velocidad <InsigniaNivel nivel={clasificarVelocidad(medicion.velocidadMaxima)} /></span>
            <span>Distancia <InsigniaNivel nivel={clasificarDistancia(medicion.distancia)} /></span>
            <span>Recuperación <InsigniaNivel nivel={clasificarRecuperacion(medicion.recuperacion)} /></span>
            <span>Frecuencia <InsigniaNivel nivel={clasificarFrecuencia(medicion.frecuenciaCardiaca)} /></span>
          </div>
          <p>Puntaje previsto: <strong>{rendimiento.puntaje}/6</strong> · <InsigniaRendimiento rendimiento={rendimiento.rendimiento} /></p>
        </div>
      )}
      {error && <p className="rf-mensaje-error" role="alert">{error}</p>}
      <div className="rf-form-acciones">
        <Boton type="submit" cargando={guardando} disabled={!valida}>Guardar medición</Boton>
        <Boton type="button" variante="secundario" onClick={alCancelar}>Cancelar</Boton>
      </div>
      <p className="rf-nota-academica">Clasificaciones académicas; no son diagnósticos médicos.</p>
    </form>
  );
}
