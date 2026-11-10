import { Building2, CalendarCheck2, Eye } from 'lucide-react';
import { Button, TableList, Tooltip, type TableColumn } from '../ui';
import type { Reserva, UsoAmbiente, UserSession } from '../../types';
import { formatearFechaLegible, formatearRangoHorario } from '../../utils/formatters';

export interface DashboardTablasSectionProps {
  session: UserSession;
  resumenPorAmbiente: UsoAmbiente[];
  proximasReservas: Reserva[];
  isLoading: boolean;
  onIrAReservas: () => void;
  onVerDetalleReserva: (reserva: Reserva) => void;
}

export function DashboardTablasSection({
  session,
  resumenPorAmbiente,
  proximasReservas,
  isLoading,
  onIrAReservas,
  onVerDetalleReserva
}: DashboardTablasSectionProps) {
  const esSolicitante = session.rol === 'Solicitante';
  const esResponsable = session.rol === 'Responsable de ambiente';

  const columnasAmbientes: TableColumn<UsoAmbiente>[] = [
    {
      key: 'ambiente',
      header: 'Ambiente Universitario',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">{row.ambienteNombre}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.ubicacion}</p>
        </div>
      )
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row) => <span className="text-slate-700 dark:text-slate-300 font-medium">{row.tipo}</span>
    },
    {
      key: 'capacidad',
      header: 'Aforo / Capacidad',
      align: 'center',
      render: (row) => (
        <span className="tabular-nums font-semibold text-slate-800 dark:text-[#F8FAFC]">
          {row.capacidad} pers.
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado Operativo',
      align: 'center',
      render: (row) => {
        const badge =
          row.estadoAmbiente === 'Disponible'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : row.estadoAmbiente === 'Mantenimiento'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-300';
        return (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge}`}
          >
            {row.estadoAmbiente}
          </span>
        );
      }
    },
    {
      key: 'aprobadas',
      header: esSolicitante ? 'Mis Aprobadas' : 'Reservas Aprobadas',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold tabular-nums">
          {row.reservasAprobadas}
        </span>
      )
    },
    {
      key: 'pendientes',
      header: esSolicitante ? 'Mis Pendientes' : 'Pendientes',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold tabular-nums">
          {row.reservasPendientes}
        </span>
      )
    },
    {
      key: 'total',
      header: esSolicitante ? 'Mis Solicitudes' : 'Total Solicitudes',
      align: 'center',
      render: (row) => (
        <span className="font-bold tabular-nums text-slate-900 dark:text-[#F8FAFC]">
          {row.totalSolicitudes}
        </span>
      )
    }
  ];

  const columnasRecientes: TableColumn<Reserva>[] = [
    {
      key: 'fechaHorario',
      header: 'Fecha y Horario',
      render: (row) => (
        <div className="tabular-nums">
          <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">
            {formatearFechaLegible(row.fecha)}
          </p>
          <p className="text-xs text-blue-800 dark:text-blue-400 font-medium">
            {formatearRangoHorario(row.horaInicio, row.horaFin)}
          </p>
        </div>
      )
    },
    {
      key: 'ambiente',
      header: 'Ambiente y Motivo',
      render: (row) => (
        <div className="max-w-[220px]">
          <p className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
            {row.ambienteNombre}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={row.motivo}>
            {row.motivo}
          </p>
        </div>
      )
    },
    ...(esSolicitante
      ? []
      : [
          {
            key: 'solicitante',
            header: 'Solicitante',
            render: (row: Reserva) => (
              <div>
                <p className="font-medium text-slate-800 dark:text-[#F8FAFC]">{row.usuarioNombre}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{row.usuarioCorreo}</p>
              </div>
            )
          }
        ]),
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (row) => {
        const estilos: Record<string, string> = {
          Aprobada: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          Pendiente: 'bg-amber-50 text-amber-800 border-amber-300',
          Rechazada: 'bg-red-50 text-red-800 border-red-300',
          Cancelada: 'bg-slate-100 text-slate-700 border-slate-300'
        };
        return (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              estilos[row.estado] ?? estilos.Pendiente
            }`}
          >
            {row.estado}
          </span>
        );
      }
    },
    {
      key: 'detalle',
      header: 'Detalle',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          tooltip="Consultar información completa de la solicitud"
          onClick={() => onVerDetalleReserva(row)}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          Ver
        </Button>
      )
    }
  ];

  if (esSolicitante) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                Mis Solicitudes de Reserva Registradas
              </h3>
            </div>
            <Tooltip content="Ir al módulo de Mis Solicitudes para filtrar o crear una reserva">
              <button
                type="button"
                onClick={onIrAReservas}
                className="text-xs font-bold text-[#1E3A8A] dark:text-blue-400 hover:underline cursor-pointer"
              >
                Registrar o filtrar mis reservas →
              </button>
            </Tooltip>
          </div>

          <TableList
            columns={columnasRecientes}
            data={proximasReservas}
            rowKey={(r) => r.id}
            isLoading={isLoading}
            emptyTitle="Aún no tiene solicitudes de reserva registradas"
            emptyDescription="Haga clic en 'Nueva solicitud de reserva' para programar un ambiente."
          />
        </section>

        <section className="xl:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                Estado Operativo de Ambientes Universitarios y Mi Uso
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Disponibilidad y mis solicitudes
            </span>
          </div>

          <TableList
            columns={columnasAmbientes}
            data={resumenPorAmbiente}
            rowKey={(r) => r.ambienteId}
            isLoading={isLoading}
            emptyTitle="Sin ambientes registrados"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <section className="xl:col-span-7 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              {esResponsable
                ? 'Supervisión de Ocupación, Aforo y Estado por Ambiente Asignado'
                : 'Consolidado Institucional de Ocupación por Ambiente'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ordenado por mayor uso aprobado
          </span>
        </div>

        <TableList
          columns={columnasAmbientes}
          data={resumenPorAmbiente}
          rowKey={(r) => r.ambienteId}
          isLoading={isLoading}
          emptyTitle="Sin ambientes registrados"
        />
      </section>

      <section className="xl:col-span-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
            {esResponsable
              ? 'Agenda de Reservas en Ambientes Asignados'
              : 'Últimas Reservas Programadas (Global)'}
          </h3>
          <Tooltip content="Abrir el listado completo de reservas con filtros avanzados">
            <button
              type="button"
              onClick={onIrAReservas}
              className="text-xs font-bold text-[#1E3A8A] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Ver todas →
            </button>
          </Tooltip>
        </div>

        <TableList
          columns={columnasRecientes}
          data={proximasReservas}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="Sin reservas registradas"
        />
      </section>
    </div>
  );
}
