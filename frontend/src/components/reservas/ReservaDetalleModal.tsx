import { Building2, Calendar, Clock, FileText, UserCheck, Users } from 'lucide-react';
import { ModalConfirmacion } from '../ui';
import type { EstadoReserva, Reserva } from '../../types';
import { formatearFechaLegible, formatearRangoHorario } from '../../utils/formatters';

export interface ReservaDetalleModalProps {
  reserva: Reserva | null;
  onClose: () => void;
}

export function ReservaDetalleModal({ reserva, onClose }: ReservaDetalleModalProps) {
  const estilosEstado: Record<EstadoReserva, string> = {
    Pendiente: 'bg-amber-50 text-amber-800 border-amber-300',
    Aprobada: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    Rechazada: 'bg-red-50 text-red-800 border-red-300',
    Cancelada: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  return (
    <ModalConfirmacion
      isOpen={!!reserva}
      title="Detalle de Solicitud de Reserva"
      description="Información académica del ambiente universitario, horario y solicitante"
      cancelText="Cerrar ventana"
      hideConfirmButton
      onConfirm={onClose}
      onClose={onClose}
    >
      {reserva && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Código de solicitud:
            </span>
            <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400">
              RES-{reserva.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Resumen principal con formato natural en español peruano */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#0F172A] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
                <span>Fecha programada</span>
              </p>
              <p className="font-bold text-slate-900 dark:text-[#F8FAFC] tabular-nums mt-0.5">
                {formatearFechaLegible(reserva.fecha)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
                <span>Horario hábil reservado</span>
              </p>
              <p className="font-bold text-blue-800 dark:text-blue-400 tabular-nums mt-0.5">
                {formatearRangoHorario(reserva.horaInicio, reserva.horaFin)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Estado de la solicitud</p>
              <span
                className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${estilosEstado[reserva.estado]}`}
              >
                {reserva.estado}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
                <span>Aforo / Capacidad</span>
              </p>
              <p className="font-bold text-slate-900 dark:text-[#F8FAFC] tabular-nums mt-0.5">
                {reserva.ambienteCapacidad} personas
              </p>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
              <span>Ambiente Universitario</span>
            </h4>
            <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">{reserva.ambienteNombre}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tipo: <strong>{reserva.ambienteTipo}</strong> • Ubicación física:{' '}
              <strong>{reserva.ambienteUbicacion}</strong>
            </p>
          </div>

          <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
              <span>Datos del Solicitante</span>
            </h4>
            <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">{reserva.usuarioNombre}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Correo institucional: <span className="font-mono">{reserva.usuarioCorreo}</span> •
              Perfil: <strong>{reserva.usuarioRol}</strong>
            </p>
          </div>

          <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
              <span>Motivo Académico o Administrativo</span>
            </h4>
            <p className="text-sm text-slate-800 dark:text-[#F8FAFC] bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              {reserva.motivo}
            </p>
          </div>
        </div>
      )}
    </ModalConfirmacion>
  );
}
