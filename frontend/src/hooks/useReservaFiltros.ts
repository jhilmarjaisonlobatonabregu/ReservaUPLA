import { useMemo, useState } from 'react';
import type { Reserva } from '../types';

interface UseReservaFiltrosReturn {
  filtroAmbienteId: string;
  setFiltroAmbienteId: (val: string) => void;
  filtroEstado: string;
  setFiltroEstado: (val: string) => void;
  filtroFecha: string;
  setFiltroFecha: (val: string) => void;
  filtroBusqueda: string;
  setFiltroBusqueda: (val: string) => void;
  limpiarFiltros: () => void;
  aplicarFiltroBusqueda: (reservasBase: Reserva[]) => Reserva[];
}

export function useReservaFiltros(): UseReservaFiltrosReturn {
  const [filtroAmbienteId, setFiltroAmbienteId] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>('');

  const limpiarFiltros = () => {
    setFiltroAmbienteId('');
    setFiltroEstado('Todos');
    setFiltroFecha('');
    setFiltroBusqueda('');
  };

  // Filtrado normalizado tolerante a tildes y mayúsculas; dependencia estable como función
  // (se recibe reservasBase como argumento para evitar captura de estado externo)
  const aplicarFiltroBusqueda = useMemo(() => {
    const normalizar = (texto: string) =>
      texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const q = normalizar(filtroBusqueda.trim());
    return (reservasBase: Reserva[]): Reserva[] => {
      if (!q) return reservasBase;
      return reservasBase.filter(
        (r) =>
          normalizar(r.ambienteNombre).includes(q) ||
          normalizar(r.usuarioNombre).includes(q) ||
          normalizar(r.motivo).includes(q) ||
          r.fecha.includes(q)
      );
    };
  }, [filtroBusqueda]);

  return {
    filtroAmbienteId,
    setFiltroAmbienteId,
    filtroEstado,
    setFiltroEstado,
    filtroFecha,
    setFiltroFecha,
    filtroBusqueda,
    setFiltroBusqueda,
    limpiarFiltros,
    aplicarFiltroBusqueda
  };
}
