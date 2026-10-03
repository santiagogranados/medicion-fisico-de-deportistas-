'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AuthFormProps = { mode: 'login' | 'register' };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === 'register';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        ...(isRegister ? { displayName: formData.get('displayName') } : {}),
      }),
    });
    const result = (await response.json()) as { error?: string };
    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.error ?? 'No se pudo completar la solicitud.');
      return;
    }

    const requestedPath = new URLSearchParams(window.location.search).get('next');
    const destination = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/';
    router.replace(destination);
    router.refresh();
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
          <p className="eyebrow">MEDIFIS · EQUIPO</p>
          <h1>{isRegister ? <>Un espacio<br /><em>para tu equipo.</em></> : <>Medir mejor.<br /><em>Entrenar con intención.</em></>}</h1>
          <p className="hero-copy">{isRegister ? 'Crea la primera cuenta local para empezar.' : 'Acceso al espacio de seguimiento.'}</p>
        </section>
        <section className="auth-panel" aria-labelledby="auth-title">
          <p className="eyebrow">{isRegister ? 'NUEVA CUENTA' : 'INICIO DE SESIÓN'}</p>
          <h2 id="auth-title">{isRegister ? 'Crear cuenta' : 'Bienvenido de nuevo'}</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label>Nombre<input name="displayName" autoComplete="name" required maxLength={100} /></label>
            )}
            <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
            <label>Contraseña<input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 12 : 1} maxLength={128} /></label>
            {isRegister && <small className="auth-hint">Mínimo 12 caracteres.</small>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Un momento...' : isRegister ? 'Crear cuenta' : 'Entrar'}</button>
          </form>
          <p className="auth-switch">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Primera vez aquí?'}{' '}
            <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Inicia sesión' : 'Crear cuenta'}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}