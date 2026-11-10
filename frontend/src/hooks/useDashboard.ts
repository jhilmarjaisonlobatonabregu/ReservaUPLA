import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '../services';
import type { DashboardIndicadores, UserSession } from '../types';

export function useDashboard(session: UserSession) {
  const [indicadores, setIndicadores] = useState<DashboardIndicadores | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.obtenerIndicadores(session.id, session.rol);
      setIndicadores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [session.id, session.rol]);

  useEffect(() => {
    void cargarDashboard();
  }, [cargarDashboard]);

  return {
    indicadores,
    isLoading,
    error,
    setError,
    cargarDashboard
  };
}
