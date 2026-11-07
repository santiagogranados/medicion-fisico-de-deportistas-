import { notFound } from 'next/navigation';
import FormularioPruebaCorreo from './formulario';

export default function PaginaPruebaCorreo() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <FormularioPruebaCorreo />;
}
