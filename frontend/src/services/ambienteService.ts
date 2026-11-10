import { apiClient } from './apiClient';
import type { Ambiente, CrearAmbientePayload, ServiceResult } from '../types';

export const ambienteService = {
  listarAmbientes: (): Promise<Ambiente[]> => apiClient.get<Ambiente[]>('/ambientes'),

  registrarAmbiente: (payload: CrearAmbientePayload): Promise<ServiceResult<Ambiente>> =>
    apiClient.post<ServiceResult<Ambiente>>('/ambientes', payload)
};
