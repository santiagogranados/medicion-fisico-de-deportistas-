import { redirect } from 'next/navigation';
import { NavegacionRendimiento } from '@/components/rendimiento/NavegacionRendimiento';
import { obtenerSesion } from '@/lib/auth/sesion';

export const dynamic = 'force-dynamic';

export default async function RendimientoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/login?next=%2Frendimiento');
  return (
    <div className="rf-app">
      <NavegacionRendimiento email={sesion.email} />
      <main className="rf-contenedor rf-contenido">{children}</main>
      <footer className="rf-pie">
        <span>MEDIFIS · RENDIMIENTO FÍSICO</span>
        <span>Herramienta académica; no sustituye evaluación profesional.</span>
      </footer>
    </div>
  );
}
