'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

type Role = 'admin' | 'editor' | 'viewer';
type UserRecord = { id: string; email: string; display_name: string; role: Role; created_at: string };

const roleLabels: Record<Role, string> = { admin: 'Administrador', editor: 'Editor', viewer: 'Consulta' };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadUsers() {
    const response = await fetch('/api/users');
    const result = (await response.json()) as { data?: UserRecord[]; error?: string };
    if (!response.ok) {
      setError(result.error ?? 'No se pudieron cargar los usuarios.');
      setLoading(false);
      return;
    }
    setUsers(result.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError('');
    setNotice('');
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        displayName: form.get('displayName'),
        password: form.get('password'),
        role: form.get('role'),
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? 'No se pudo crear el usuario.');
      return;
    }
    formElement.reset();
    setNotice('Usuario creado. Ya puede iniciar sesión.');
    await loadUsers();
  }

  async function updateUser(event: FormEvent<HTMLFormElement>, user: UserRecord) {
    event.preventDefault();
    if (saving) return;
    setError('');
    setNotice('');
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        displayName: form.get('displayName'),
        role: form.get('role'),
        password: form.get('password'),
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? 'No se pudo actualizar el usuario.');
      return;
    }
    setEditingId(null);
    setNotice('Cambios guardados.');
    await loadUsers();
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
          <span aria-current="page">Usuarios</span>
          <button className="logout-button" type="button" onClick={logOut}>Cerrar sesión</button>
        </nav>
      </header>

      <section className="users-page">
        <div className="section-heading">
          <div><p className="eyebrow">ADMINISTRACIÓN</p><h1>Usuarios</h1></div>
          <span className="count-badge">{users.length} cuentas</span>
        </div>

        <form className="user-create-form" onSubmit={createUser}>
          <div className="user-form-heading"><div><p className="eyebrow">NUEVA CUENTA</p><h2>Agregar usuario</h2></div></div>
          <div className="user-form-grid">
            <label>Nombre<input name="displayName" autoComplete="name" required maxLength={100} /></label>
            <label>Correo<input name="email" type="email" autoComplete="email" required /></label>
            <label>Contraseña temporal<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
            <label>Rol<select name="role" defaultValue="viewer"><option value="viewer">Consulta</option><option value="editor">Editor</option><option value="admin">Administrador</option></select></label>
          </div>
          <div className="user-form-actions"><small>La contraseña debe tener al menos 12 caracteres.</small><button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear usuario'}</button></div>
        </form>

        {error && <p className="auth-error user-feedback" role="alert">{error}</p>}
        {notice && <p className="auth-notice user-feedback" role="status">{notice}</p>}

        <section className="user-list-section" aria-labelledby="user-list-title">
          <div className="user-list-heading"><h2 id="user-list-title">Cuentas registradas</h2><span>{users.length} en total</span></div>
          {loading ? <p className="users-empty">Cargando usuarios...</p> : users.length === 0 ? <p className="users-empty">Todavía no hay cuentas para mostrar.</p> : (
            <div className="user-list">
              {users.map((user) => editingId === user.id ? (
                <form className="user-row user-edit-row" key={user.id} onSubmit={(event) => updateUser(event, user)}>
                  <label>Nombre<input name="displayName" defaultValue={user.display_name} required maxLength={100} /></label>
                  <label>Correo<input name="email" type="email" defaultValue={user.email} required /></label>
                  <label>Nuevo rol<select name="role" defaultValue={user.role}><option value="viewer">Consulta</option><option value="editor">Editor</option><option value="admin">Administrador</option></select></label>
                  <label>Nueva contraseña<input name="password" type="password" minLength={12} maxLength={128} placeholder="Sin cambios" /></label>
                  <div className="user-row-actions"><button type="button" className="user-cancel" onClick={() => setEditingId(null)}>Cancelar</button><button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
                </form>
              ) : (
                <article className="user-row" key={user.id}>
                  <div className="user-identity"><span className="user-avatar">{user.display_name.slice(0, 1).toUpperCase()}</span><div><strong>{user.display_name}</strong><span>{user.email}</span></div></div>
                  <span className={`user-role role-${user.role}`}>{roleLabels[user.role]}</span>
                  <time>{new Date(user.created_at).toLocaleDateString('es-CO')}</time>
                  <button className="user-edit-button" type="button" onClick={() => { setError(''); setEditingId(user.id); }}>Editar</button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
      <footer><span>MEDIFIS / CONTROL FÍSICO</span><span>Administración de cuentas</span></footer>
    </main>
  );
}