export type EstadoAmbiente = 'Disponible' | 'Mantenimiento' | 'Inactivo';

export interface Ambiente {
  id: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  ubicacion: string;
  estado: EstadoAmbiente;
  totalReservasAprobadas: number;
}

export interface CrearAmbientePayload {
  nombre: string;
  tipo: string;
  capacidad: number;
  ubicacion: string;
  estado: EstadoAmbiente;
}

export interface ErroresFormularioAmbiente {
  nombre?: string;
  tipo?: string;
  capacidad?: string;
  ubicacion?: string;
}
