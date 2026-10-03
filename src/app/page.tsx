'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Note = { id: string; title: string; content: string; category: string; pinned: boolean; updatedAt: string };
type Health = { status: string; version: string; environment: string; uptime: number };
type UserProfile = { id: string; displayName: string; role: string };

const categories = ['general', 'importante', 'pendiente'] as const;

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [category, setCategory] = useState<(typeof categories)[number] | 'todas'>('todas');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('general');
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    const [notesResponse, healthResponse, profileResponse] = await Promise.all([
      fetch('/api/data/note'),
      fetch('/api/health'),
      fetch('/api/auth/me'),
    ]);
    const notesBody = (await notesResponse.json()) as { data: Note[] };
    const healthBody = (await healthResponse.json()) as { data: Health };
    const profileBody = (await profileResponse.json()) as { data?: UserProfile };
    setNotes(notesBody.data ?? []);
    setHealth(healthBody.data);
    setProfile(profileBody.data ?? null);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    await fetch('/api/data/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category: selectedCategory, pinned: false }),
    });
    setTitle('');
    setContent('');
    await loadData();
    setIsSaving(false);
  }

  async function logOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }

  const visibleNotes = category === 'todas' ? notes : notes.filter((note) => note.category === category);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand"><span className="brand-mark">M</span><span>medifis</span></div>
        <nav className="topbar-meta" aria-label="Navegación principal"><span className="status-dot" /> Sistema operativo {profile?.role === 'admin' && <Link className="topbar-link" href="/users">Usuarios</Link>}<button className="logout-button" type="button" onClick={logOut}>Cerrar sesión</button></nav>
      </header>

      <section className="hero">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow">CENTRO DE RENDIMIENTO · 2026</p>
          <h1>Medir mejor.<br /><em>Entrenar con intención.</em></h1>
          <p className="hero-copy">Un espacio claro para registrar observaciones, seguir rutinas y mantener al equipo alineado.</p>
        </motion.div>
        <div className="health-card">
          <div className="health-label">ESTADO DEL SISTEMA</div>
          <strong><span className="status-dot" /> {health?.status === 'ok' ? 'Todo en orden' : 'Comprobando...'}</strong>
          <span>v{health?.version ?? '0.1.0'} · {health?.environment ?? 'development'}</span>
        </div>
      </section>

      <section className="workspace">
        <div className="section-heading"><div><p className="eyebrow">SEGUIMIENTO</p><h2>Notas del equipo</h2></div><span className="count-badge">{visibleNotes.length} registros</span></div>
        <div className="workspace-grid">
          <form className="note-form" onSubmit={submitNote}>
            <p className="eyebrow">NUEVA NOTA</p>
            <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Revisión de movilidad" /></label>
            <label>Observación<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Escribe una observación para el equipo..." rows={5} /></label>
            <label>Categoría<select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as typeof selectedCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar nota'}</button>
          </form>
          <div className="notes-panel">
            <div className="filters">{(['todas', ...categories] as const).map((item) => <button className={category === item ? 'filter active' : 'filter'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
            {visibleNotes.length === 0 ? <div className="empty-state"><span>✦</span><p>Aún no hay notas en esta vista.</p><small>Registra la primera observación del equipo.</small></div> : <div className="notes-list">{visibleNotes.map((note) => <article className="note-item" key={note.id}><div className="note-top"><span className={`tag tag-${note.category}`}>{note.category}</span><time>{new Date(note.updatedAt).toLocaleDateString('es-CO')}</time></div><h3>{note.title}</h3><p>{note.content || 'Sin observación adicional.'}</p></article>)}</div>}
          </div>
        </div>
      </section>
      <footer><span>MEDIFIS / CONTROL FÍSICO</span><span>Construido para decisiones más precisas.</span></footer>
    </main>
  );
}
