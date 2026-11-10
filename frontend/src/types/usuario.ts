import type { RolUsuario } from './common';

export interface Usuario {
  id: string;
  nombreCompleto: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
  totalReservas: number;
}

export interface CrearUsuarioPayload {
  nombreCompleto: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
}

export interface ErroresFormularioUsuario {
  nombreCompleto?: string;
  correo?: string;
  rol?: string;
}
