import { Ban, CalendarPlus, CheckCircle2, Eye, Lock, RotateCcw, XCircle } from 'lucide-react';
import { Button, TableList, Tooltip, type TableColumn } from '../ui';
import type { EstadoReserva, Reserva, UserSession } from '../../types';
import { formatearFechaLegible, formatearRangoHorario } from '../../utils/formatters';

export interface ReservaTableSectionProps {
  reservas: Reserva[];
  isLoading: boolean;
  session: UserSession;
  hayFiltrosActivos?: boolean;
  onLimpiarFiltros?: () => void;
  onAbrirModalReserva?: () => void;
  onVerDetalle: (reserva: Reserva) => void;
  onSolicitarCambioEstado: (reserva: Reserva, nuevoEstado: EstadoReserva) => void;
}

export function ReservaTableSection({
  reservas,
  isLoading,
  session,
  hayFiltrosActivos = false,
  onLimpiarFiltros,
  onAbrirModalReserva,
  onVerDetalle,
  onSolicitarCambioEstado
}: ReservaTableSectionProps) {
  const esAdmin = session.rol === 'Administrador';
  const esSolicitante = session.rol === 'Solicitante';
  const esResponsable = session.rol === 'Responsable de ambiente';

  const columnasReservas: TableColumn<Reserva>[] = [
    {
      key: 'fechaHora',
      header: 'Fecha y Horario',
      render: (row) => (
        <div className="tabular-nums">
          <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">
            {formatearFechaLegible(row.fecha)}
          </p>
          <p className="text-xs font-medium text-blue-800 dark:text-blue-400">
            {formatearRangoHorario(row.horaInicio, row.horaFin)}
          </p>
        </div>
      )
    },
    {
      key: 'ambiente',
      header: 'Ambiente Universitario',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">{row.ambienteNombre}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {row.ambienteTipo} • Cap. {row.ambienteCapacidad} pers.
          </p>
        </div>
      )
    },
    {
      key: 'solicitante',
      header: 'Solicitante y Motivo',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{row.usuarioNombre}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5" title={row.motivo}>
            {row.motivo}
          </p>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (row) => {
        const estilos: Record<EstadoReserva, string> = {
          Pendiente: 'bg-amber-50 text-amber-800 border-amber-300',
          Aprobada: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          Rechazada: 'bg-red-50 text-red-800 border-red-300',
          Cancelada: 'bg-slate-100 text-slate-700 border-slate-300'
        };
        return (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border cursor-default select-none ${estilos[row.estado]}`}
            >
              {row.estado}
            </span>
            {row.estado === 'Rechazada' && (
              <Tooltip
                content="Una reserva rechazada es definitiva y no admite modificaciones posteriores"
                position="top"
              >
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 cursor-help">
                  <Lock className="w-3 h-3" /> Inmutable
                </span>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      key: 'acciones',
      header: esAdmin
        ? 'Acciones de Control'
        : esSolicitante
          ? 'Mis Acciones'
          : 'Consulta',
      align: 'right',
      render: (row) => {
        const esRechazada = row.estado === 'Rechazada';
        const puedeCancelar =
          !esRechazada &&
          row.estado !== 'Cancelada' &&
          (esAdmin || (esSolicitante && row.usuarioId === session.id));

        return (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              tooltip="Consultar información completa de la solicitud y del ambiente"
              onClick={() => onVerDetalle(row)}
              icon={<Eye className="w-3.5 h-3.5" />}
            >
              Detalle
            </Button>

            {/* Solo el Administrador ve y puede usar los botones Aprobar y Rechazar */}
            {esAdmin && !esRechazada && row.estado !== 'Aprobada' && (
              <Button
                variant="success"
                size="sm"
                tooltip="Aprobar solicitud y bloquear horario del ambiente"
                onClick={() => onSolicitarCambioEstado(row, 'Aprobada')}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Aprobar
              </Button>
            )}

            {esAdmin && !esRechazada && (
              <Button
                variant="danger"
                size="sm"
                tooltip="Rechazar solicitud de forma definitiva e inmutable"
                onClick={() => onSolicitarCambioEstado(row, 'Rechazada')}
                icon={<XCircle className="w-3.5 h-3.5" />}
              >
                Rechazar
              </Button>
            )}

            {puedeCancelar && (
              <Button
                variant="secondary"
                size="sm"
                tooltip="Cancelar solicitud de reserva y liberar el bloque horario"
                onClick={() => onSolicitarCambioEstado(row, 'Cancelada')}
                icon={<Ban className="w-3.5 h-3.5" />}
              >
                Cancelar
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  // Donald Norman Cap. 2 (Salvar los Abismos de Ejecución y Evaluación cuando no hay coincidencias)
  const accionEstadoVacio = hayFiltrosActivos && onLimpiarFiltros ? (
    <Button
      variant="outline"
      size="sm"
      onClick={onLimpiarFiltros}
      icon={<RotateCcw className="w-4 h-4" />}
      tooltip="Restablecer todos los filtros para volver a ver las reservas"
    >
      Restablecer filtros activos
    </Button>
  ) : !esResponsable && onAbrirModalReserva ? (
    <Button
      variant="primary"
      size="sm"
      onClick={onAbrirModalReserva}
      icon={<CalendarPlus className="w-4 h-4" />}
      tooltip="Abrir formulario para registrar su primera solicitud de reserva"
    >
      Registrar nueva solicitud
    </Button>
  ) : undefined;

  return (
    <TableList
      columns={columnasReservas}
      data={reservas}
      rowKey={(r) => r.id}
      isLoading={isLoading}
      emptyTitle={
        hayFiltrosActivos
          ? 'Ninguna reserva coincide con los filtros aplicados'
          : esSolicitante
            ? 'Aún no ha registrado solicitudes de reserva'
            : 'No hay solicitudes de reserva registradas'
      }
      emptyDescription={
        hayFiltrosActivos
          ? 'Pruebe con otro ambiente, fecha o estado, o restablezca los filtros con el botón inferior.'
          : esSolicitante
            ? 'Inicie el proceso registrando una solicitud y validando la disponibilidad del ambiente en tiempo real.'
            : 'Las solicitudes registradas por los docentes, estudiantes y administrativos aparecerán en este listado.'
      }
      emptyAction={accionEstadoVacio}
    />
  );
}
