import type { RolUsuario } from './common';

export interface UserSession {
  id: string;
  nombreCompleto: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
  facultadDependencia: string;
  loginTimestamp: string;
}

export interface DemoAccountOption {
  id: string;
  nombreCompleto: string;
  correo: string;
  claveAcceso: string;
  rol: RolUsuario;
  cargo: string;
  descripcionPermisos: string;
}
