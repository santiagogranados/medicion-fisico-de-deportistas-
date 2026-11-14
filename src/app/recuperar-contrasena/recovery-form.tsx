'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export function RecoveryForm() {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const email = new FormData(event.currentTarget).get('email');
      if (typeof email !== 'string') {
        setError('Escribe un correo electrónico válido.');
        return;
      }

      const response = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(result.error ?? 'No se pudo solicitar el restablecimiento. Inténtalo de nuevo más tarde.');
        return;
      }

      setNotice(result.message ?? 'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.');
    } catch {
      setError('No se pudo conectar con el servicio de acceso. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <header className="auth-topbar">
        <Link className="brand" href="/" aria-label="Medifis">
          <span className="brand-mark">M</span><span>medifis</span>
        </Link>
        <span className="auth-context">CONTROL FÍSICO / ACCESO</span>
      </header>
      <div className="auth-content">
        <section className="auth-intro">
          <p className="eyebrow">MEDIFIS · ACCESO</p>
          <h1>Recupera<br /><em>tu cuenta.</em></h1>
          <p className="hero-copy">Te enviaremos instrucciones al correo asociado a tu cuenta.</p>
        </section>
        <section className="auth-panel" aria-labelledby="recovery-title">
          <p className="eyebrow">RESTABLECIMIENTO</p>
          <h2 id="recovery-title">¿Olvidaste tu contraseña?</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-notice" role="status">{notice}</p>}
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}</button>
          </form>
          <p className="auth-switch"><Link href="/login">Volver a iniciar sesión</Link></p>
        </section>
      </div>
    </main>
  );
}
