export type RolUsuario = 'Administrador' | 'Solicitante' | 'Responsable de ambiente';

export type ModuloSistema = 'dashboard' | 'reservas' | 'ambientes' | 'usuarios';

export interface ServiceResult<T> {
  exito: boolean;
  isSuccess?: boolean;
  mensaje: string;
  message?: string;
  datos: T | null;
  data?: T | null;
  errores: string[];
}

export interface FeedbackAlert {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string[];
}
