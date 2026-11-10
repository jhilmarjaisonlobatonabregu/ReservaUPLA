import { DEFAULT_CONNECTION_ERROR_MESSAGE, SESSION_STORAGE_KEY } from '../utils/constants';
import type { UserSession } from '../types/auth';
import type { ServiceResult } from '../types/common';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

const API_BASE = '/api';

function obtenerHeadersSesionActiva(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};
    const sesion = JSON.parse(raw) as UserSession;
    if (!sesion?.id || !sesion?.rol) return {};
    return {
      'X-Usuario-Id': sesion.id,
      'X-Usuario-Rol': sesion.rol
    };
  } catch {
    return {};
  }
}

function obtenerMensajeRecuperacionNatural(status: number): string {
  if (status === 401 || status === 403) {
    return 'Su rol actual no cuenta con autorización para realizar esta operación. Inicie sesión con una cuenta de Administrador si requiere permisos de gestión.';
  }
  if (status === 404) {
    return 'El registro solicitado ya no se encuentra disponible. Actualice el listado e inténtelo nuevamente.';
  }
  if (status >= 400 && status < 500) {
    return 'No se pudo procesar la solicitud. Revise los campos marcados en el formulario e inténtelo nuevamente.';
  }
  return 'El servicio institucional experimentó un inconveniente temporal. Por favor, vuelva a intentarlo en unos segundos.';
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    ...obtenerHeadersSesionActiva(),
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders as Record<string, string>)
  };

  let response: Response;
  try {
    response = await window.fetch(`${API_BASE}${endpoint}`, {
      ...restOptions,
      headers,
      body:
        body !== undefined
          ? typeof body === 'string'
            ? body
            : JSON.stringify(body)
          : undefined
    });
  } catch {
    throw new Error(DEFAULT_CONNECTION_ERROR_MESSAGE);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? ((await response.json()) as T) : ({} as T);

  if (!response.ok) {
    const asResult = data as unknown as ServiceResult<unknown>;
    const msg =
      asResult?.mensaje ||
      asResult?.message ||
      obtenerMensajeRecuperacionNatural(response.status);
    throw new Error(msg);
  }

  return data;
}

export const apiClient = {
  get: <T>(endpoint: string): Promise<T> => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, { method: 'PUT', body }),
  patch: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string): Promise<T> => request<T>(endpoint, { method: 'DELETE' })
};
