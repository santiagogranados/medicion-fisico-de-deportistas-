import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Medifis | Mediciones físicas de deportistas',
  description: 'Panel operativo para registrar y seguir la evolución física de deportistas.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
