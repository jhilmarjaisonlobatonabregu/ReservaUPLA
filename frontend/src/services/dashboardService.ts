import { apiClient } from './apiClient';
import type { DashboardIndicadores, RolUsuario } from '../types';

export const dashboardService = {
  obtenerIndicadores: (usuarioId?: string, rol?: RolUsuario): Promise<DashboardIndicadores> => {
    const params = new URLSearchParams();
    if (usuarioId) params.set('usuarioId', usuarioId);
    if (rol) params.set('rol', rol);
    const qs = params.toString();
    return apiClient.get<DashboardIndicadores>(`/dashboard${qs ? `?${qs}` : ''}`);
  }
};
