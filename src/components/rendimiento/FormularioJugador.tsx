'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import { Selector } from '@/components/ui/Selector';
import { InsigniaNivel } from '@/components/rendimiento/InsigniaNivel';
import { InsigniaRendimiento } from '@/components/rendimiento/InsigniaRendimiento';
import { POSICIONES, EDAD_MAX, EDAD_MIN, FC_MAX, FC_MIN } from '@/lib/config/rendimiento';
import { clasificarDistancia, clasificarFrecuencia, clasificarRecuperacion, clasificarVelocidad, calcularRendimiento } from '@/lib/reglas/clasificacion';
import { velocidadPromedioKmh } from '@/lib/reglas/calculos';
import { validarJugador } from '@/lib/reglas/jugador';
import { validarMedicion } from '@/lib/reglas/medicion';

type Valores = {
  nombre: string;
  edad: string;
  posicion: string;
  codigo: string;
  distancia: string;
  tiempoPrueba: string;
  velocidadMaxima: string;
  frecuenciaCardiaca: string;
  recuperacion: string;
  sprints: string;
};

const valoresIniciales: Valores = {
  nombre: '',
  edad: '',
  posicion: '',
  codigo: '',
  distancia: '',
  tiempoPrueba: '',
  velocidadMaxima: '',
  frecuenciaCardiaca: '',
  recuperacion: '',
  sprints: '',
};

type DatosNumericos = Omit<Valores, 'nombre' | 'posicion'>;

function numero(valor: string): number {
  return valor.trim() === '' ? Number.NaN : Number(valor);
}

function validar(valores: Valores): Record<string, string> {
  const errores: Record<string, string> = {};
  const edad = numero(valores.edad);
  const codigo = numero(valores.codigo);
  const distancia = numero(valores.distancia);
  const tiempo = numero(valores.tiempoPrueba);
  const velocidad = numero(valores.velocidadMaxima);
  const frecuencia = numero(valores.frecuenciaCardiaca);
  const recuperacion = numero(valores.recuperacion);
  const sprints = numero(valores.sprints);

  if (!valores.nombre.trim()) errores.nombre = 'Ingresa el nombre del jugador.';
  if (!Number.isInteger(edad) || edad < EDAD_MIN || edad > EDAD_MAX) errores.edad = `La edad debe estar entre ${EDAD_MIN} y ${EDAD_MAX} años.`;
  if (!valores.posicion) errores.posicion = 'Selecciona una posición.';
  if (!Number.isInteger(codigo) || codigo < 1 || codigo > 2147483647) errores.codigo = 'El código debe ser un entero entre 1 y 2.147.483.647.';
  if (!Number.isInteger(distancia) || distancia <= 0) errores.distancia = 'La distancia debe ser un entero mayor que 0.';
  if (!Number.isFinite(tiempo) || tiempo <= 0 || Math.abs(tiempo * 100 - Math.round(tiempo * 100)) >= 1e-8) errores.tiempoPrueba = 'El tiempo debe ser mayor que 0 y tener máximo dos decimales.';
  if (!Number.isFinite(velocidad) || velocidad < 0 || Math.abs(velocidad * 100 - Math.round(velocidad * 100)) >= 1e-8) errores.velocidadMaxima = 'La velocidad máxima debe ser no negativa y tener máximo dos decimales.';
  if (!Number.isInteger(frecuencia) || frecuencia < FC_MIN || frecuencia > FC_MAX) errores.frecuenciaCardiaca = `La frecuencia debe estar entre ${FC_MIN} y ${FC_MAX} ppm.`;
  if (!Number.isInteger(recuperacion) || recuperacion < 0) errores.recuperacion = 'La recuperación debe ser un entero mayor o igual a 0.';
  if (!Number.isInteger(sprints) || sprints < 0) errores.sprints = 'Los sprints deben ser un entero mayor o igual a 0.';
  return errores;
}

export function FormularioJugador() {
  const router = useRouter();
  const [valores, setValores] = useState<Valores>(valoresIniciales);
  const [errorApi, setErrorApi] = useState('');
  const [guardando, setGuardando] = useState(false);
  const errores = validar(valores);
  const datosValidos = Object.keys(errores).length === 0;
  const medicion = {
    distancia: numero(valores.distancia),
    tiempoPrueba: numero(valores.tiempoPrueba),
    velocidadMaxima: numero(valores.velocidadMaxima),
    frecuenciaCardiaca: numero(valores.frecuenciaCardiaca),
    recuperacion: numero(valores.recuperacion),
    sprints: numero(valores.sprints),
  };
  const mostrarVistaPrevia = Number.isFinite(medicion.distancia) && medicion.distancia > 0
    && Number.isFinite(medicion.tiempoPrueba) && medicion.tiempoPrueba > 0
    && Number.isFinite(medicion.velocidadMaxima) && medicion.velocidadMaxima >= 0
    && Number.isInteger(medicion.frecuenciaCardiaca) && medicion.frecuenciaCardiaca >= FC_MIN && medicion.frecuenciaCardiaca <= FC_MAX
    && Number.isInteger(medicion.recuperacion) && medicion.recuperacion >= 0
    && Number.isInteger(medicion.sprints) && medicion.sprints >= 0;
  const promedio = mostrarVistaPrevia ? velocidadPromedioKmh(medicion.distancia, medicion.tiempoPrueba) : null;
  const rendimiento = mostrarVistaPrevia ? calcularRendimiento(medicion) : null;

  function cambiar(campo: keyof Valores, valor: string) {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setErrorApi('');
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const erroresActuales = validar(valores);
    if (Object.keys(erroresActuales).length > 0) return;

    try {
      validarJugador({ nombre: valores.nombre, edad: numero(valores.edad), posicion: valores.posicion });
      validarMedicion(medicion);
    } catch {
      setErrorApi('Revisa los datos: algunos valores no cumplen las reglas del proyecto.');
      return;
    }

    setGuardando(true);
    setErrorApi('');
    try {
      const response = await fetch('/api/rendimiento/jugadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: numero(valores.codigo),
          nombre: valores.nombre.trim(),
          edad: numero(valores.edad),
          posicion: valores.posicion,
          ...medicion,
        }),
      });
      const resultado: unknown = await response.json();
      if (!response.ok || typeof resultado !== 'object' || resultado === null || !('ok' in resultado) || resultado.ok !== true
        || !('datos' in resultado) || typeof resultado.datos !== 'object' || resultado.datos === null
        || !('jugador' in resultado.datos) || typeof resultado.datos.jugador !== 'object' || resultado.datos.jugador === null
        || !('codigo' in resultado.datos.jugador) || typeof resultado.datos.jugador.codigo !== 'number') {
        const mensaje = typeof resultado === 'object' && resultado !== null && 'error' in resultado
          && typeof resultado.error === 'object' && resultado.error !== null && 'mensaje' in resultado.error
          && typeof resultado.error.mensaje === 'string'
          ? resultado.error.mensaje
          : 'No fue posible registrar el jugador.';
        throw new Error(mensaje);
      }
      router.push(`/rendimiento/jugadores/${resultado.datos.jugador.codigo}`);
      router.refresh();
    } catch (error) {
      setErrorApi(error instanceof Error ? error.message : 'No fue posible registrar el jugador.');
    } finally {
      setGuardando(false);
    }
  }

  function campo(campoNombre: keyof DatosNumericos, etiqueta: string, opciones?: { step?: string; min?: string; max?: string; ayuda?: string }) {
    return (
      <Campo
        etiqueta={etiqueta}
        name={campoNombre}
        type="number"
        value={valores[campoNombre]}
        onChange={(evento) => cambiar(campoNombre, evento.target.value)}
        {...(errores[campoNombre] ? { error: errores[campoNombre] } : {})}
        step={opciones?.step ?? '1'}
        min={opciones?.min}
        max={opciones?.max}
        ayuda={opciones?.ayuda}
        required
      />
    );
  }

  return (
    <form className="rf-formulario" onSubmit={guardar} noValidate>
      <section className="rf-form-seccion" aria-labelledby="datos-jugador">
        <h2 id="datos-jugador">Datos del jugador</h2>
        <div className="rf-form-grid">
          <Campo etiqueta="Nombre completo" name="nombre" value={valores.nombre} onChange={(evento) => cambiar('nombre', evento.target.value)} {...(errores.nombre ? { error: errores.nombre } : {})} maxLength={120} required />
          {campo('edad', 'Edad', { min: String(EDAD_MIN), max: String(EDAD_MAX) })}
          <Selector
            etiqueta="Posición"
            name="posicion"
            value={valores.posicion}
            onChange={(evento) => cambiar('posicion', evento.target.value)}
            {...(errores.posicion ? { error: errores.posicion } : {})}
            opciones={[{ valor: '', etiqueta: 'Selecciona una posición' }, ...POSICIONES.map((item) => ({ valor: item, etiqueta: item }))]}
          />
          {campo('codigo', 'Código', { min: '1', max: '2147483647' })}
        </div>
      </section>

      <section className="rf-form-seccion" aria-labelledby="datos-medicion">
        <h2 id="datos-medicion">Medición inicial</h2>
        <div className="rf-form-grid">
          {campo('distancia', 'Distancia (m)', { min: '1' })}
          {campo('tiempoPrueba', 'Tiempo de prueba (s)', { min: '0.01', step: '0.01' })}
          {campo('velocidadMaxima', 'Velocidad máxima (km/h)', { min: '0', step: '0.01' })}
          {campo('frecuenciaCardiaca', 'Frecuencia cardíaca (ppm)', { min: String(FC_MIN), max: String(FC_MAX) })}
          {campo('recuperacion', 'Recuperación (s)', { min: '0' })}
          {campo('sprints', 'Sprints', { min: '0' })}
        </div>
      </section>

      {mostrarVistaPrevia && promedio !== null && rendimiento && (
        <section className="rf-vista-previa" aria-live="polite">
          <h2>Vista previa</h2>
          <p>Velocidad promedio: <strong>{promedio.toLocaleString('es-CO', { maximumFractionDigits: 2 })} km/h</strong></p>
          <div className="rf-vista-insignias">
            <span>Velocidad máxima <InsigniaNivel nivel={clasificarVelocidad(medicion.velocidadMaxima)} /></span>
            <span>Distancia <InsigniaNivel nivel={clasificarDistancia(medicion.distancia)} /></span>
            <span>Recuperación <InsigniaNivel nivel={clasificarRecuperacion(medicion.recuperacion)} /></span>
            <span>Frecuencia cardíaca <InsigniaNivel nivel={clasificarFrecuencia(medicion.frecuenciaCardiaca)} /></span>
          </div>
          <p>Puntaje: <strong>{rendimiento.puntaje}/6</strong> · <InsigniaRendimiento rendimiento={rendimiento.rendimiento} /></p>
          <p className="rf-nota-academica">La clasificación es académica y no constituye una evaluación médica.</p>
        </section>
      )}

      {errorApi && <p className="rf-mensaje-error" role="alert">{errorApi}</p>}
      <div className="rf-form-acciones">
        <Boton type="submit" cargando={guardando} disabled={!datosValidos}>Guardar jugador y medición</Boton>
        <p className="rf-nota-academica">Las mediciones y alertas son indicadores académicos, no diagnósticos médicos.</p>
      </div>
    </form>
  );
}
