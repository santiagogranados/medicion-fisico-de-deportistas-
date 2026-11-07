export function formatearVelocidad(centesimas: number): string {
  return `${(centesimas / 100).toLocaleString('es-CO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} km/h`;
}

export function formatearFecha(fecha: string | Date): string {
  let valor: Date;
  let timeZone = 'America/Bogota';
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [year, month, day] = fecha.split('-').map(Number);
    valor = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
    timeZone = 'UTC';
  } else {
    valor = fecha instanceof Date ? fecha : new Date(fecha);
  }
  if (Number.isNaN(valor.getTime())) throw new RangeError('Fecha inválida.');
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone }).format(valor);
}

export function formatearDistancia(metros: number): string {
  return `${metros.toLocaleString('es-CO')} m`;
}
