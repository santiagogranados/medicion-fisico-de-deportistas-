'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function UpdatePasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    void createSupabaseBrowserClient().auth.getUser()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError || !data.user) {
          setError('El enlace no es válido o ya venció. Solicita uno nuevo.');
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (active) setError('No se pudo validar el enlace. Solicita uno nuevo.');
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const form = new FormData(event.currentTarget);
      const password = form.get('password');
      const confirmation = form.get('confirmation');

      if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
        setError('La contraseña debe tener entre 12 y 128 caracteres.');
        return;
      }
      if (password !== confirmation) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      const { error: updateError } = await createSupabaseBrowserClient().auth.updateUser({ password });
      if (updateError) {
        setError('No se pudo actualizar la contraseña. Solicita un enlace nuevo e inténtalo otra vez.');
        return;
      }

      await createSupabaseBrowserClient().auth.signOut();
      router.replace('/login?password_updated=1');
      router.refresh();
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
          <h1>Elige una<br /><em>nueva clave.</em></h1>
          <p className="hero-copy">Usa una contraseña segura de al menos 12 caracteres.</p>
        </section>
        <section className="auth-panel" aria-labelledby="update-title">
          <p className="eyebrow">NUEVA CONTRASEÑA</p>
          <h2 id="update-title">Actualiza tu contraseña</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={!ready || isSubmitting} /></label>
            <label>Confirma la contraseña<input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={!ready || isSubmitting} /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={!ready || isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar contraseña'}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
