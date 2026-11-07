'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';

const avisoAcademico = 'Datos simulados con fines académicos. Las clasificaciones y alertas son indicadores del proyecto, no diagnósticos médicos.';

export function NavegacionRendimiento({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);

  useEffect(() => {
    const clave = 'medifis-aviso-academico-v1';
    if (window.localStorage.getItem(clave) !== 'visto') {
      setMostrarAviso(true);
      window.localStorage.setItem(clave, 'visto');
    }
  }, []);

  async function cerrarSesion() {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) throw new Error('No se pudo cerrar la sesión.');
    router.replace('/login');
    router.refresh();
  }

  const links = [
    { href: '/rendimiento', etiqueta: 'Jugadores' },
    { href: '/rendimiento/alertas', etiqueta: 'Alertas' },
    { href: '/rendimiento/calculadora', etiqueta: 'Calculadora' },
  ];

  return (
    <>
      <header className="rf-nav">
        <Link className="rf-marca" href="/rendimiento">Rendimiento <span>Físico</span></Link>
        <button
          type="button"
          className="rf-menu-movil"
          aria-expanded={menuAbierto}
          aria-controls="rf-enlaces"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? 'Cerrar menú' : 'Menú'}
        </button>
        <nav id="rf-enlaces" className={menuAbierto ? 'rf-enlaces rf-enlaces-abiertos' : 'rf-enlaces'} aria-label="Navegación de rendimiento">
          {links.map(({ href, etiqueta }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              onClick={() => setMenuAbierto(false)}
            >
              {etiqueta}
            </Link>
          ))}
          <Link href="/notas">Notas del equipo</Link>
        </nav>
        <div className="rf-sesion">
          <span title={email}>{email}</span>
          <button type="button" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>
      <div className="rf-contenedor">
        {mostrarAviso && (
          <Aviso tipo="info">
            <div className="rf-aviso-cierre">
              <span>{avisoAcademico}</span>
              <button type="button" aria-label="Cerrar aviso académico" onClick={() => setMostrarAviso(false)}>Cerrar</button>
            </div>
          </Aviso>
        )}
      </div>
    </>
  );
}
