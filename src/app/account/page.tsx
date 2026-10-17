'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError('');
    setNotice('');
    setSaving(true);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.get('currentPassword'),
          newPassword: formData.get('newPassword'),
          confirmPassword: formData.get('confirmPassword'),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'No se pudo cambiar la contraseña.');
        return;
      }

      formElement.reset();
      setNotice('Tu contraseña se cambió correctamente.');
    } catch {
      setError('No se pudo contactar al servidor. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function logOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <header className="topbar">
        <Link className="brand users-brand" href="/"><span className="brand-mark">M</span><span>medifis</span></Link>
        <nav className="users-nav" aria-label="Navegación principal">
          <Link href="/">Panel</Link>
          <span aria-current="page">Seguridad</span>
          <button className="logout-button" type="button" onClick={logOut}>Cerrar sesión</button>
        </nav>
      </header>

      <section className="users-page account-page">
        <div className="section-heading">
          <div><p className="eyebrow">CUENTA</p><h1>Cambiar contraseña</h1></div>
        </div>

        <form className="user-create-form account-form" onSubmit={changePassword}>
          <div className="user-form-heading"><div><p className="eyebrow">SEGURIDAD</p><h2>Actualiza tus credenciales</h2></div></div>
          <div className="user-form-grid account-form-grid">
            <label>Contraseña actual<input name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></label>
            <label>Nueva contraseña<input name="newPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
            <label>Confirma la nueva contraseña<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
          </div>
          <div className="user-form-actions"><small>Usa al menos 12 caracteres.</small><button type="submit" disabled={saving}>{saving ? 'Actualizando...' : 'Cambiar contraseña'}</button></div>
        </form>

        {error && <p className="auth-error user-feedback" role="alert">{error}</p>}
        {notice && <p className="auth-notice user-feedback" role="status">{notice}</p>}
      </section>
      <footer><span>MEDIFIS / CONTROL FÍSICO</span><span>Seguridad de la cuenta</span></footer>
    </main>
  );
}