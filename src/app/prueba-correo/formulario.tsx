'use client';

import { FormEvent, useState } from 'react';

export default function FormularioPruebaCorreo() {
  const [para, setPara] = useState('santiagogranados200709@gmail.com');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);

  async function enviarPrueba(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    setEnviando(true);
    setMensaje('');
    setError(false);

    try {
      const respuesta = await fetch('/api/correo/prueba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ para }),
      });
      const resultado = (await respuesta.json()) as { error?: string };

      if (!respuesta.ok) {
        setMensaje(resultado.error ?? 'No se pudo enviar el correo.');
        setError(true);
        return;
      }

      setMensaje('Correo enviado');
    } catch {
      setMensaje('No se pudo contactar al servidor. Inténtalo de nuevo.');
      setError(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="correo-title">
        <p className="eyebrow">MEDIFIS · RESEND</p>
        <h1 id="correo-title">Prueba de correo</h1>
        <form className="auth-form" onSubmit={enviarPrueba}>
          <label>
            Correo electrónico
            <input
              type="email"
              name="para"
              autoComplete="email"
              value={para}
              onChange={(event) => setPara(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar prueba'}
          </button>
          {mensaje && (
            <p className={error ? 'auth-error' : 'auth-notice'} role={error ? 'alert' : 'status'}>
              {mensaje}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
