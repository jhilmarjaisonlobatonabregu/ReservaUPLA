import { apiClient } from './apiClient';
import type {
  CambiarEstadoPayload,
  CrearReservaPayload,
  DisponibilidadResponse,
  FiltrosReserva,
  Reserva,
  ServiceResult
} from '../types';

export const reservaService = {
  listarReservas: (filtros?: FiltrosReserva): Promise<Reserva[]> => {
    const params = new URLSearchParams();
    if (filtros?.ambienteId) params.set('ambienteId', filtros.ambienteId);
    if (filtros?.estado && filtros.estado !== 'Todos') params.set('estado', filtros.estado);
    if (filtros?.fecha) params.set('fecha', filtros.fecha);
    if (filtros?.usuarioId) params.set('usuarioId', filtros.usuarioId);
    const qs = params.toString();
    return apiClient.get<Reserva[]>(`/reservas${qs ? `?${qs}` : ''}`);
  },

  obtenerDetalleReserva: (id: string): Promise<ServiceResult<Reserva>> =>
    apiClient.get<ServiceResult<Reserva>>(`/reservas/${id}`),

  validarDisponibilidad: (
    ambienteId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ): Promise<ServiceResult<DisponibilidadResponse>> => {
    const params = new URLSearchParams({
      ambienteId,
      fecha,
      horaInicio,
      horaFin
    });
    return apiClient.get<ServiceResult<DisponibilidadResponse>>(
      `/reservas/disponibilidad?${params.toString()}`
    );
  },

  registrarReserva: (payload: CrearReservaPayload): Promise<ServiceResult<Reserva>> =>
    apiClient.post<ServiceResult<Reserva>>('/reservas', payload),

  cambiarEstadoReserva: (
    id: string,
    payload: CambiarEstadoPayload
  ): Promise<ServiceResult<Reserva>> =>
    apiClient.patch<ServiceResult<Reserva>>(`/reservas/${id}/estado`, payload)
};
