import {
  ArrowRight,
  BellRing,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Lock,
  SearchCheck
} from 'lucide-react';
import {
  AlertMessage,
  Button,
  PageHeader,
  ReservaDetalleModal,
  ReservaEstadoConfirmModal,
  ReservaFilterBar,
  ReservaFormCard,
  ReservaTableSection,
  Tooltip
} from '../components';
import { useReservasManagement } from '../hooks';
import type { UserSession } from '../types';
import { formatearFechaLegible, formatearRangoHorario } from '../utils/formatters';

export interface ReservasPageProps {
  session: UserSession;
}

export function ReservasPage({ session }: ReservasPageProps) {
  const {
    usuarios,
    ambientes,
    reservas,
    todasLasReservas,
    isLoading,
    isModalOpen,
    abrirModalReserva,
    cerrarModalReserva,
    filtroAmbienteId,
    setFiltroAmbienteId,
    filtroEstado,
    setFiltroEstado,
    filtroFecha,
    setFiltroFecha,
    filtroBusqueda,
    setFiltroBusqueda,
    limpiarFiltros,
    usuarioId,
    setUsuarioId,
    ambienteId,
    setAmbienteId,
    fecha,
    setFecha,
    horaInicio,
    setHoraInicio,
    horaFin,
    setHoraFin,
    motivo,
    setMotivo,
    erroresForm,
    setErroresForm,
    isSubmitting,
    isCheckingDisp,
    alerta,
    setAlerta,
    disponibilidadInfo,
    setDisponibilidadInfo,
    reservaDetalle,
    setReservaDetalle,
    modalCambioEstado,
    setModalCambioEstado,
    isChangingStatus,
    aplicarBloqueHorarioRapido,
    limpiarFormulario,
    handleVerificarDisponibilidad,
    handleRegistrarReserva,
    handleConfirmarCambioEstado
  } = useReservasManagement(session);

  const esResponsable = session.rol === 'Responsable de ambiente';
  const reservasPendientes = todasLasReservas.filter((r) => r.estado === 'Pendiente');
  const proximaPendiente = reservasPendientes[0] ?? null;

  const hayFiltrosActivos =
    Boolean(filtroAmbienteId) ||
    filtroEstado !== 'Todos' ||
    Boolean(filtroFecha) ||
    Boolean(filtroBusqueda.trim());

  const tituloPorRol =
    session.rol === 'Solicitante'
      ? 'Mis Solicitudes de Reserva de Ambientes'
      : esResponsable
        ? 'Consulta de Agenda y Disponibilidad de Ambientes'
        : 'Gestión de Solicitudes y Control de Reservas';

  const subtituloPorRol =
    session.rol === 'Solicitante'
      ? 'Registre sus solicitudes de reserva, verifique disponibilidad horaria y consulte el estado de sus pedidos.'
      : esResponsable
        ? 'Supervisión de horarios ocupados, consulta de detalle y verificador de disponibilidad en tiempo real.'
        : 'Registro de solicitudes, verificación previa de disponibilidad y aprobación o rechazo de reservas.';

  return (
    <div className="space-y-5">
      <PageHeader
        title={tituloPorRol}
        subtitle={subtituloPorRol}
        badge={`Sesión: ${session.rol}`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Tooltip
              content="Las solicitudes de reserva solo pueden programarse entre las 07:00 y las 22:00 horas"
              position="bottom"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700 shadow-2xs text-xs font-medium text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
                <span>Horario de atención:</span>
                <strong className="font-bold tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                  07:00 – 22:00 h
                </strong>
              </div>
            </Tooltip>

            <Button
              variant="primary"
              onClick={abrirModalReserva}
              tooltip={
                esResponsable
                  ? 'Abrir ventana para verificar disponibilidad de ambientes en cualquier horario'
                  : 'Abrir ventana modal para registrar una nueva solicitud de reserva'
              }
              tooltipPosition="bottom"
              icon={
                esResponsable ? (
                  <SearchCheck className="w-4 h-4" />
                ) : (
                  <CalendarPlus className="w-4 h-4" />
                )
              }
            >
              {esResponsable
                ? 'Verificar Disponibilidad'
                : 'Nueva Solicitud de Reserva'}
            </Button>
          </div>
        }
      />

      {/* Donald Norman Cap. 1 y Cap. 6: Imagen del Sistema que comunica el Modelo Conceptual del ciclo de vida */}
      <div
        aria-label="Flujo del ciclo de vida de una reserva"
        className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs"
      >
        <span className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
          Ciclo de Reserva UPLA:
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[11px] flex items-center justify-center">
              1
            </span>
            <span>Registro inicial en estado</span>
            <strong className="text-amber-700 dark:text-amber-400">Pendiente</strong>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" aria-hidden="true" />

          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200 font-bold text-[11px] flex items-center justify-center">
              2
            </span>
            <span>Evaluación de Administrador (07:00–22:00 h)</span>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" aria-hidden="true" />

          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <strong className="text-emerald-700 dark:text-emerald-400">Aprobada</strong>
            <span className="text-slate-400">/</span>
            <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <strong className="text-rose-700 dark:text-rose-400">Rechazada (Definitiva)</strong>
          </span>
        </div>
      </div>

      {proximaPendiente && (
        <div
          role="status"
          aria-label="Recordatorio de solicitudes pendientes"
          className="bg-amber-50/90 dark:bg-amber-950/35 rounded-2xl border border-amber-300 dark:border-amber-800/70 px-4 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            {/* SEÑAL (Norman): Badge cromático y numérico */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[11px] shrink-0 shadow-2xs">
              <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{reservasPendientes.length} Pendiente{reservasPendientes.length === 1 ? '' : 's'}</span>
            </span>

            {/* MENSAJE (Norman): Detalle exacto de qué solicitud, ambiente y horario requiere atención */}
            <p className="text-amber-950 dark:text-amber-200 leading-relaxed">
              <strong className="font-bold">
                {session.rol === 'Administrador'
                  ? 'Atención requerida para evaluación:'
                  : 'Seguimiento de solicitud en espera:'}
              </strong>{' '}
              <span className="font-semibold">{proximaPendiente.ambienteNombre}</span> solicitado por{' '}
              <span className="font-semibold">{proximaPendiente.usuarioNombre}</span> para el{' '}
              <span className="font-bold tabular-nums">
                {formatearFechaLegible(proximaPendiente.fecha)} (
                {formatearRangoHorario(proximaPendiente.horaInicio, proximaPendiente.horaFin)})
              </span>
              {reservasPendientes.length > 1
                ? ` y ${reservasPendientes.length - 1} solicitud(es) adicional(es).`
                : '.'}
            </p>
          </div>

          {filtroEstado !== 'Pendiente' && (
            <button
              type="button"
              onClick={() => setFiltroEstado('Pendiente')}
              className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold text-[11px] hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            >
              Filtrar pendientes
            </button>
          )}
        </div>
      )}

      {alerta && (
        <AlertMessage
          type={alerta.type}
          title={alerta.title}
          message={alerta.message}
          details={alerta.details}
          onClose={() => setAlerta(null)}
        />
      )}

      {/* Barra de filtros y tabla expandidas al 100% del ancho disponible */}
      <section className="w-full space-y-4">
        <ReservaFilterBar
          ambientes={ambientes}
          filtroAmbienteId={filtroAmbienteId}
          onFiltroAmbienteChange={setFiltroAmbienteId}
          filtroEstado={filtroEstado}
          onFiltroEstadoChange={setFiltroEstado}
          filtroFecha={filtroFecha}
          onFiltroFechaChange={setFiltroFecha}
          filtroBusqueda={filtroBusqueda}
          onFiltroBusquedaChange={setFiltroBusqueda}
          onLimpiarFiltros={limpiarFiltros}
          rolActivo={session.rol}
          totalMostradas={reservas.length}
        />

        <ReservaTableSection
          reservas={reservas}
          isLoading={isLoading}
          session={session}
          hayFiltrosActivos={hayFiltrosActivos}
          onLimpiarFiltros={limpiarFiltros}
          onAbrirModalReserva={abrirModalReserva}
          onVerDetalle={setReservaDetalle}
          onSolicitarCambioEstado={(reserva, nuevoEstado) =>
            setModalCambioEstado({ reserva, nuevoEstado })
          }
        />
      </section>

      {/* Modal interactivo con información en tiempo real del ambiente */}
      <ReservaFormCard
        isOpen={isModalOpen}
        session={session}
        usuarios={usuarios}
        ambientes={ambientes}
        reservasExistentes={todasLasReservas}
        campos={{
          usuarioId,
          onUsuarioIdChange: (val) => {
            setUsuarioId(val);
            if (erroresForm.usuarioId) setErroresForm((prev) => ({ ...prev, usuarioId: undefined }));
          },
          ambienteId,
          onAmbienteIdChange: (val) => {
            setAmbienteId(val);
            setDisponibilidadInfo(null);
            if (erroresForm.ambienteId) setErroresForm((prev) => ({ ...prev, ambienteId: undefined }));
          },
          fecha,
          onFechaChange: (val) => {
            setFecha(val);
            setDisponibilidadInfo(null);
            if (erroresForm.fecha) setErroresForm((prev) => ({ ...prev, fecha: undefined }));
          },
          horaInicio,
          onHoraInicioChange: (val) => {
            setHoraInicio(val);
            setDisponibilidadInfo(null);
            if (erroresForm.horaInicio) setErroresForm((prev) => ({ ...prev, horaInicio: undefined }));
          },
          horaFin,
          onHoraFinChange: (val) => {
            setHoraFin(val);
            setDisponibilidadInfo(null);
            if (erroresForm.horaFin) setErroresForm((prev) => ({ ...prev, horaFin: undefined }));
          },
          motivo,
          onMotivoChange: (val) => {
            setMotivo(val);
            if (erroresForm.motivo) setErroresForm((prev) => ({ ...prev, motivo: undefined }));
          }
        }}
        estado={{
          erroresForm,
          disponibilidadInfo,
          onClearDisponibilidad: () => setDisponibilidadInfo(null),
          isSubmitting,
          isCheckingDisp
        }}
        acciones={{
          onAplicarBloqueRapido: aplicarBloqueHorarioRapido,
          onLimpiarFormulario: limpiarFormulario,
          onVerificarDisponibilidad: () => void handleVerificarDisponibilidad(),
          onSubmit: (e) => void handleRegistrarReserva(e),
          onClose: cerrarModalReserva
        }}
      />

      <ReservaDetalleModal
        reserva={reservaDetalle}
        onClose={() => setReservaDetalle(null)}
      />

      <ReservaEstadoConfirmModal
        solicitudCambio={modalCambioEstado}
        reservasExistentes={todasLasReservas}
        isLoading={isChangingStatus}
        onConfirm={() => void handleConfirmarCambioEstado()}
        onClose={() => setModalCambioEstado(null)}
      />
    </div>
  );
}
