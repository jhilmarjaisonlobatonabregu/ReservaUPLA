import { apiClient } from './apiClient';
import type { CrearUsuarioPayload, ServiceResult, Usuario } from '../types';

export const usuarioService = {
  listarUsuarios: (): Promise<Usuario[]> => apiClient.get<Usuario[]>('/usuarios'),

  registrarUsuario: (payload: CrearUsuarioPayload): Promise<ServiceResult<Usuario>> =>
    apiClient.post<ServiceResult<Usuario>>('/usuarios', payload)
};
