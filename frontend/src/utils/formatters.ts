export function obtenerFechaHoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function obtenerIniciales(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'UP';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

export function formatearRangoHorario(horaInicio: string, horaFin: string): string {
  return `${horaInicio} a ${horaFin} h`;
}

/**
 * Convierte una fecha ISO (YYYY-MM-DD) al formato natural en español peruano (DD/MM/YYYY).
 */
export function formatearFechaLegible(fechaIso: string): string {
  if (!fechaIso) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaIso.trim());
  if (!match) return fechaIso;
  const [, anio, mes, dia] = match;
  return `${dia}/${mes}/${anio}`;
}
