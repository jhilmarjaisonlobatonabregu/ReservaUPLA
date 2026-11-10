import type { RolUsuario } from './common';

export type EstadoReserva = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Cancelada';

export interface Reserva {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado: EstadoReserva;
  usuarioId: string;
  usuarioNombre: string;
  usuarioCorreo: string;
  usuarioRol: RolUsuario;
  ambienteId: string;
  ambienteNombre: string;
  ambienteTipo: string;
  ambienteCapacidad: number;
  ambienteUbicacion: string;
}

export interface CrearReservaPayload {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  usuarioId: string;
  ambienteId: string;
}

export interface CambiarEstadoPayload {
  nuevoEstado: EstadoReserva;
  rolActor: RolUsuario;
}

export interface FiltrosReserva {
  ambienteId?: string;
  estado?: string;
  fecha?: string;
  usuarioId?: string;
}

export interface ReservaConflicto {
  id: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoReserva;
  solicitante: string;
  motivo: string;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  mensaje: string;
  conflictos: ReservaConflicto[];
}

export interface ErroresFormularioReserva {
  usuarioId?: string;
  ambienteId?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  motivo?: string;
}
