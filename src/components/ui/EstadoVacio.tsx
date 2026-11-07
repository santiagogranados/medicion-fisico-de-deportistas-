export function EstadoVacio({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="rf-vacio">
      <h2>{titulo}</h2>
      <p>{detalle}</p>
    </div>
  );
}
