'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Boton } from '@/components/ui/Boton';
import { InsigniaNivel } from '@/components/rendimiento/InsigniaNivel';
import { InsigniaRendimiento } from '@/components/rendimiento/InsigniaRendimiento';
import { FormularioMedicion } from '@/components/rendimiento/FormularioMedicion';
import { PanelAlertas } from '@/components/rendimiento/PanelAlertas';
import type { JugadorConRendimiento, Medicion } from '@/lib/datos/tipos';
import { clasificarDistancia, clasificarFrecuencia, clasificarRecuperacion, clasificarVelocidad } from '@/lib/reglas/clasificacion';

function formatear(valor: number, decimales = 2): string {
  return valor.toLocaleString('es-CO', { maximumFractionDigits: decimales });
}

export function FichaJugador({ datos, historial }: { datos: JugadorConRendimiento; historial: Medicion[] }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const { jugador, medicion, clasificaciones, puntaje, rendimiento } = datos;

  return (
    <section className="rf-seccion">
      <div className="rf-encabezado">
        <div>
          <p className="rf-ceja">FICHA DEL JUGADOR · CÓDIGO {jugador.codigo}</p>
          <h1>{jugador.nombre}</h1>
          <p className="rf-intro">{jugador.posicion} · {jugador.edad} años · {jugador.activo ? 'Activo' : 'Inactivo'}</p>
        </div>
        <div className="rf-ficha-acciones">
          <Link className="rf-boton rf-boton-secundario" href="/rendimiento">Volver a jugadores</Link>
          <Boton type="button" onClick={() => setMostrarFormulario((visible) => !visible)}>
            {mostrarFormulario ? 'Cerrar formulario' : 'Nueva medición'}
          </Boton>
        </div>
      </div>

      {mostrarFormulario && <FormularioMedicion codigo={jugador.codigo} alCancelar={() => setMostrarFormulario(false)} />}

      {!medicion || !clasificaciones ? (
        <div className="rf-vacio"><h2>Sin mediciones</h2><p>Registra una medición para consultar clasificaciones y rendimiento.</p></div>
      ) : (
        <>
          <section className="rf-ficha-panel">
            <div className="rf-ficha-puntaje">
              <span>Rendimiento general</span>
              <InsigniaRendimiento rendimiento={rendimiento} />
              <strong>{puntaje}/6</strong>
            </div>
            <div className="rf-clasificaciones">
              <div><span>Velocidad máxima</span><strong>{formatear(medicion.velocidadMaxima)} km/h</strong><InsigniaNivel nivel={clasificaciones.velocidad} /></div>
              <div><span>Distancia</span><strong>{formatear(medicion.distancia, 0)} m</strong><InsigniaNivel nivel={clasificaciones.distancia} /></div>
              <div><span>Recuperación</span><strong>{formatear(medicion.recuperacion, 0)} s</strong><InsigniaNivel nivel={clasificaciones.recuperacion} /></div>
              <div><span>Frecuencia cardíaca</span><strong>{formatear(medicion.frecuenciaCardiaca, 0)} ppm</strong><InsigniaNivel nivel={clasificaciones.frecuencia} /></div>
            </div>
            <dl className="rf-medicion-detalles">
              <div><dt>Velocidad promedio</dt><dd>{formatear(medicion.velocidadPromedio)} km/h</dd></div>
              <div><dt>Tiempo de prueba</dt><dd>{formatear(medicion.tiempoPrueba)} s</dd></div>
              <div><dt>Sprints</dt><dd>{formatear(medicion.sprints, 0)}</dd></div>
              <div><dt>Fecha</dt><dd>{medicion.fecha}</dd></div>
            </dl>
            {(clasificaciones.velocidad === 'baja' || clasificaciones.recuperacion === 'lenta' || clasificaciones.frecuencia === 'alerta') && (
              <PanelAlertas
                alertas={{
                  velocidadBaja: clasificaciones.velocidad === 'baja' ? [datos] : [],
                  recuperacionLenta: clasificaciones.recuperacion === 'lenta' ? [datos] : [],
                  frecuenciaAlerta: clasificaciones.frecuencia === 'alerta' ? [datos] : [],
                }}
              />
            )}
            <p className="rf-nota-academica">Las clasificaciones y alertas son indicadores académicos del proyecto, no diagnósticos médicos.</p>
          </section>

          <section className="rf-historial">
            <div className="rf-encabezado"><div><p className="rf-ceja">EVOLUCIÓN</p><h2>Historial de mediciones</h2></div></div>
            {historial.length === 0 ? <p className="rf-nota-academica">No hay mediciones históricas para mostrar.</p> : (
              <div className="rf-historial-lista">
                {historial.map((item) => (
                  <article className="rf-historial-item" key={item.id}>
                    <div className="rf-historial-cabecera"><strong>{item.fecha}</strong><span>{formatear(item.velocidadMaxima)} km/h máxima · {formatear(item.velocidadPromedio)} km/h promedio</span></div>
                    <div className="rf-vista-insignias">
                      <span>Velocidad <InsigniaNivel nivel={clasificarVelocidad(item.velocidadMaxima)} /></span>
                      <span>Distancia <InsigniaNivel nivel={clasificarDistancia(item.distancia)} /></span>
                      <span>Recuperación <InsigniaNivel nivel={clasificarRecuperacion(item.recuperacion)} /></span>
                      <span>Frecuencia <InsigniaNivel nivel={clasificarFrecuencia(item.frecuenciaCardiaca)} /></span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
