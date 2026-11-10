import { useEffect, useMemo, type FormEvent } from 'react';
import {
  CalendarPlus,
  SearchCheck,
  UserCheck,
  X
} from 'lucide-react';
import {
  DateInput,
  SelectInput,
  TextInput,
  TimeInput,
  Tooltip
} from '../ui';
import type {
  Ambiente,
  DisponibilidadResponse,
  ErroresFormularioReserva,
  Reserva,
  UserSession,
  Usuario
} from '../../types';
import {
  HORA_MAXIMA_INSTITUCIONAL,
  HORA_MINIMA_INSTITUCIONAL
} from '../../utils/constants';
import { obtenerFechaHoyIso } from '../../utils/formatters';
import { AmbienteFichaCard } from './AmbienteFichaCard';
import { BarraAccionesModal } from './BarraAccionesModal';
import { BannerDisponibilidad } from './BannerDisponibilidad';
import { BloquesHorariosRapidos } from './BloquesHorariosRapidos';
import { ConflictoHorarioAlert } from './ConflictoHorarioAlert';

/** Campos del formulario con sus handlers de cambio. */
export interface ReservaFormCampos {
  usuarioId: string;
  onUsuarioIdChange: (val: string) => void;
  ambienteId: string;
  onAmbienteIdChange: (val: string) => void;
  fecha: string;
  onFechaChange: (val: string) => void;
  horaInicio: string;
  onHoraInicioChange: (val: string) => void;
  horaFin: string;
  onHoraFinChange: (val: string) => void;
  motivo: string;
  onMotivoChange: (val: string) => void;
}

/** Estado derivado del formulario (validaciones, disponibilidad, loaders). */
export interface ReservaFormEstado {
  erroresForm: ErroresFormularioReserva;
  disponibilidadInfo: DisponibilidadResponse | null;
  onClearDisponibilidad: () => void;
  isSubmitting: boolean;
  isCheckingDisp: boolean;
}

/** Acciones que el formulario puede despachar hacia el hook padre. */
export interface ReservaFormAcciones {
  onAplicarBloqueRapido: (inicio: string, fin: string) => void;
  onLimpiarFormulario: () => void;
  onVerificarDisponibilidad: () => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

export interface ReservaFormCardProps {
  isOpen: boolean;
  session: UserSession;
  usuarios: Usuario[];
  ambientes: Ambiente[];
  reservasExistentes: Reserva[];
  campos: ReservaFormCampos;
  estado: ReservaFormEstado;
  acciones: ReservaFormAcciones;
}

export function ReservaFormCard({
  isOpen,
  session,
  usuarios,
  ambientes,
  reservasExistentes,
  campos,
  estado,
  acciones
}: ReservaFormCardProps) {
  const {
    usuarioId,
    onUsuarioIdChange,
    ambienteId,
    onAmbienteIdChange,
    fecha,
    onFechaChange,
    horaInicio,
    onHoraInicioChange,
    horaFin,
    onHoraFinChange,
    motivo,
    onMotivoChange
  } = campos;
  const {
    erroresForm,
    disponibilidadInfo,
    onClearDisponibilidad,
    isSubmitting,
    isCheckingDisp
  } = estado;
  const {
    onAplicarBloqueRapido,
    onLimpiarFormulario,
    onVerificarDisponibilidad,
    onSubmit,
    onClose
  } = acciones;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const ambienteSeleccionado = useMemo(
    () => ambientes.find((a) => a.id === ambienteId),
    [ambientes, ambienteId]
  );

  // Shneiderman Regla 8 (Reducir carga de memoria a corto plazo):
  // Calcular en tiempo real las reservas del ambiente en la fecha elegida y si el horario seleccionado está libre u ocupado
  const reservasDelAmbienteEnFecha = useMemo(() => {
    if (!ambienteId || !fecha) return [];
    return reservasExistentes
      .filter(
        (r) =>
          r.ambienteId === ambienteId &&
          r.fecha === fecha &&
          (r.estado === 'Aprobada' || r.estado === 'Pendiente')
      )
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [reservasExistentes, ambienteId, fecha]);

  const conflictoEnTiempoReal = useMemo(() => {
    if (!horaInicio || !horaFin || horaFin <= horaInicio) return null;
    return (
      reservasDelAmbienteEnFecha.find(
        (r) =>
          r.estado === 'Aprobada' &&
          horaInicio < r.horaFin &&
          horaFin > r.horaInicio
      ) ?? null
    );
  }, [reservasDelAmbienteEnFecha, horaInicio, horaFin]);

  const horarioValido =
    Boolean(horaInicio) &&
    Boolean(horaFin) &&
    horaFin > horaInicio &&
    horaInicio >= HORA_MINIMA_INSTITUCIONAL &&
    horaFin <= HORA_MAXIMA_INSTITUCIONAL;

  if (!isOpen) return null;

  const esResponsable = session.rol === 'Responsable de ambiente';
  const esSolicitante = session.rol === 'Solicitante'; // usado en la sección de solicitante autenticado
  const hoyIso = obtenerFechaHoyIso();
  const tieneBorradorEnCurso = motivo.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reserva-title"
      onClick={() => {
        if (!isSubmitting && !tieneBorradorEnCurso) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal (Shneiderman Regla 1 y Regla 4) */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50/80 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#1E3A8A] dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
              {esResponsable ? (
                <SearchCheck className="w-5 h-5" />
              ) : (
                <CalendarPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3
                id="modal-reserva-title"
                className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]"
              >
                {esResponsable
                  ? 'Verificador de Disponibilidad de Ambiente'
                  : 'Nueva Solicitud de Reserva de Ambiente'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {esResponsable
                  ? 'Consulte cruces de horario en los ambientes asignados'
                  : '1. Seleccione ambiente y fecha • 2. Verifique horario en vivo • 3. Confirme su solicitud'}
              </p>
            </div>
          </div>

          <Tooltip content="Cerrar ventana (Esc)" position="left">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar ventana modal"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={onSubmit} noValidate className="p-6 space-y-3.5">
          {disponibilidadInfo && (
            <BannerDisponibilidad
              disponibilidadInfo={disponibilidadInfo}
              onClose={onClearDisponibilidad}
            />
          )}

          {!esResponsable && (
            <>
              {esSolicitante ? (
                <div className="rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-700 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Solicitante Autenticado
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                        {session.nombreCompleto}{' '}
                        <span className="font-mono font-normal text-slate-500 dark:text-slate-400">
                          ({session.correo})
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    Sesión Activa
                  </span>
                </div>
              ) : (
                <SelectInput
                  id="reserva-solicitante"
                  label="Solicitante"
                  required
                  value={usuarioId}
                  onChange={(e) => onUsuarioIdChange(e.target.value)}
                  error={erroresForm.usuarioId}
                  options={usuarios
                    .filter((u) => u.activo && u.rol !== 'Responsable de ambiente')
                    .map((u) => ({
                      value: u.id,
                      label: `${u.nombreCompleto} (${u.rol})`
                    }))}
                />
              )}
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Shneiderman Regla 5: Deshabilitar ambientes en Mantenimiento o Inactivos para prevenir errores */}
            <SelectInput
              id="reserva-ambiente"
              label="Ambiente Universitario"
              required
              value={ambienteId}
              onChange={(e) => onAmbienteIdChange(e.target.value)}
              error={erroresForm.ambienteId}
              helperText="Los ambientes en mantenimiento están deshabilitados para nuevas reservas."
              options={ambientes.map((a) => ({
                value: a.id,
                disabled: !esResponsable && a.estado !== 'Disponible',
                label:
                  a.estado === 'Disponible'
                    ? `${a.nombre} (${a.capacidad} pers. • Disponible)`
                    : `${a.nombre} (${a.estado} — No disponible)`
              }))}
            />

            <DateInput
              id="reserva-fecha"
              label="Fecha Programada"
              required
              min={!esResponsable ? hoyIso : undefined}
              value={fecha}
              onChange={(e) => onFechaChange(e.target.value)}
              error={erroresForm.fecha}
              helperText="Seleccione la fecha del evento académico"
            />
          </div>

          {/* Shneiderman Regla 8 (Reducir carga de memoria a corto plazo):
              Ficha en vivo con capacidad, ubicación, estado operativo y disponibilidad en tiempo real */}
          {ambienteSeleccionado && (
            <AmbienteFichaCard
              ambiente={ambienteSeleccionado}
              fecha={fecha}
              horaInicio={horaInicio}
              horaFin={horaFin}
              horarioValido={horarioValido}
              conflictoEnTiempoReal={conflictoEnTiempoReal}
              reservasDelAmbienteEnFecha={reservasDelAmbienteEnFecha}
            />
          )}

          {/* Atajos de bloques académicos frecuentes (Shneiderman Regla 2: Usabilidad universal para expertos) */}
          <BloquesHorariosRapidos
            horaInicio={horaInicio}
            horaFin={horaFin}
            onAplicarBloque={onAplicarBloqueRapido}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <TimeInput
              id="reserva-hora-inicio"
              label="Hora de Inicio"
              required
              min="07:00"
              max="22:00"
              value={horaInicio}
              onChange={(e) => onHoraInicioChange(e.target.value)}
              error={erroresForm.horaInicio}
              helperText="Mínimo 07:00 h"
            />

            <TimeInput
              id="reserva-hora-fin"
              label="Hora de Fin"
              required
              min="07:00"
              max="22:00"
              value={horaFin}
              onChange={(e) => onHoraFinChange(e.target.value)}
              error={erroresForm.horaFin}
              helperText="Máximo 22:00 h (mayor al inicio)"
            />
          </div>

          {!esResponsable && (
            <TextInput
              id="reserva-motivo"
              label="Motivo Académico o Administrativo"
              placeholder="Ej. Taller práctico de Diseño de Sistemas - VIII Ciclo"
              required
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
              error={erroresForm.motivo}
              helperText="Describa la actividad docente, laboratorio o sustentación (mín. 5 caracteres)"
            />
          )}

          {/* Donald Norman Cap. 4 y Cap. 5: Restricción lógica y aviso proactivo contra Mistakes antes de enviar */}
          {!esResponsable && conflictoEnTiempoReal && (
            <ConflictoHorarioAlert conflicto={conflictoEnTiempoReal} />
          )}

          {/* Pie de acciones uniforme del Modal (Shneiderman Regla 1, 4 y 6: Cancelar a la izquierda, Primaria a la derecha) */}
          <BarraAccionesModal
            esResponsable={esResponsable}
            isSubmitting={isSubmitting}
            isCheckingDisp={isCheckingDisp}
            onLimpiarFormulario={onLimpiarFormulario}
            onVerificarDisponibilidad={onVerificarDisponibilidad}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
}
