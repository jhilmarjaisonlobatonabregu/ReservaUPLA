import { Filter, RotateCcw, Search, ShieldAlert, X } from 'lucide-react';
import { DateInput, SelectInput, TextInput, Tooltip } from '../ui';
import type { Ambiente, RolUsuario } from '../../types';

export interface ReservaFilterBarProps {
  ambientes: Ambiente[];
  filtroAmbienteId: string;
  onFiltroAmbienteChange: (val: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (val: string) => void;
  filtroFecha: string;
  onFiltroFechaChange: (val: string) => void;
  filtroBusqueda: string;
  onFiltroBusquedaChange: (val: string) => void;
  onLimpiarFiltros: () => void;
  rolActivo: RolUsuario;
  totalMostradas: number;
}

export function ReservaFilterBar({
  ambientes,
  filtroAmbienteId,
  onFiltroAmbienteChange,
  filtroEstado,
  onFiltroEstadoChange,
  filtroFecha,
  onFiltroFechaChange,
  filtroBusqueda,
  onFiltroBusquedaChange,
  onLimpiarFiltros,
  rolActivo,
  totalMostradas
}: ReservaFilterBarProps) {
  const hayFiltrosActivos =
    Boolean(filtroAmbienteId) ||
    filtroEstado !== 'Todos' ||
    Boolean(filtroFecha) ||
    Boolean(filtroBusqueda.trim());

  const estadosRapidos = ['Todos', 'Pendiente', 'Aprobada', 'Rechazada', 'Cancelada'];

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 p-5 shadow-xs space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          <Filter className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
          <span>Filtros de Supervisión y Disponibilidad</span>
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-slate-700 tabular-nums">
            {totalMostradas} resultado(s)
          </span>
        </div>

        {hayFiltrosActivos && (
          <Tooltip
            content="Limpiar todos los filtros activos en un solo clic"
            position="left"
          >
            <button
              type="button"
              onClick={onLimpiarFiltros}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer filtros</span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* Píldoras de filtro rápido por estado con Tooltips (Shneiderman Regla 2) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {estadosRapidos.map((est) => {
          const activo = filtroEstado === est;
          return (
            <Tooltip
              key={est}
              content={
                est === 'Todos'
                  ? 'Mostrar solicitudes de todos los estados'
                  : `Filtrar listado por estado: ${est}`
              }
              position="top"
            >
              <button
                type="button"
                onClick={() => onFiltroEstadoChange(est)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activo
                    ? 'bg-[#1E3A8A] dark:bg-[#3B82F6] text-white border-[#1E3A8A] dark:border-[#3B82F6] shadow-2xs'
                    : 'bg-slate-50 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {est === 'Todos' ? 'Todos los estados' : est}
              </button>
            </Tooltip>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        <TextInput
          id="filtro-busqueda"
          label="Búsqueda Rápida"
          placeholder="Ambiente, solicitante o motivo..."
          value={filtroBusqueda}
          onChange={(e) => onFiltroBusquedaChange(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          rightElement={
            filtroBusqueda ? (
              <Tooltip content="Limpiar texto de búsqueda" position="top">
                <button
                  type="button"
                  onClick={() => onFiltroBusquedaChange('')}
                  aria-label="Limpiar búsqueda"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            ) : undefined
          }
        />

        <SelectInput
          id="filtro-ambiente"
          label="Ambiente Universitario"
          value={filtroAmbienteId}
          onChange={(e) => onFiltroAmbienteChange(e.target.value)}
          options={[
            { value: '', label: 'Todos los ambientes' },
            ...ambientes.map((a) => ({ value: a.id, label: a.nombre }))
          ]}
        />

        <SelectInput
          id="filtro-estado"
          label="Estado de Solicitud"
          value={filtroEstado}
          onChange={(e) => onFiltroEstadoChange(e.target.value)}
          options={[
            { value: 'Todos', label: 'Todos los estados' },
            { value: 'Pendiente', label: 'Pendiente' },
            { value: 'Aprobada', label: 'Aprobada' },
            { value: 'Rechazada', label: 'Rechazada' },
            { value: 'Cancelada', label: 'Cancelada' }
          ]}
        />

        <DateInput
          id="filtro-fecha"
          label="Fecha Específica"
          value={filtroFecha}
          onChange={(e) => onFiltroFechaChange(e.target.value)}
        />
      </div>

      {rolActivo !== 'Administrador' && (
        <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/90 border border-amber-200 rounded-xl px-3.5 py-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Control de Acceso por Rol:</strong> Sesión iniciada como{' '}
            <strong>{rolActivo}</strong>. La aprobación y rechazo de reservas es exclusiva del rol{' '}
            <strong>Administrador</strong>.
          </span>
        </div>
      )}
    </div>
  );
}
