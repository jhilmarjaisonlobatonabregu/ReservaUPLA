import { useMemo } from 'react';
import { TriangleAlert } from 'lucide-react';
import { ModalConfirmacion } from '../ui';
import type { EstadoReserva, Reserva } from '../../types';
import { formatearFechaLegible, formatearRangoHorario } from '../../utils/formatters';

export interface ReservaEstadoConfirmModalProps {
  solicitudCambio: {
    reserva: Reserva;
    nuevoEstado: EstadoReserva;
  } | null;
  reservasExistentes?: Reserva[];
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ReservaEstadoConfirmModal({
  solicitudCambio,
  reservasExistentes = [],
  isLoading,
  onConfirm,
  onClose
}: ReservaEstadoConfirmModalProps) {
  // Heurística 5 de Nielsen (Prevención de Slips y Mistakes):
  // Detectar si existen otras solicitudes Pendientes o Aprobadas que se crucen en el mismo bloque antes de Aprobar
  const otrasPendientesEnCruce = useMemo(() => {
    if (!solicitudCambio || solicitudCambio.nuevoEstado !== 'Aprobada') return [];
    const actual = solicitudCambio.reserva;
    return reservasExistentes.filter(
      (r) =>
        r.id !== actual.id &&
        r.ambienteId === actual.ambienteId &&
        r.fecha === actual.fecha &&
        r.estado === 'Pendiente' &&
        actual.horaInicio < r.horaFin &&
        actual.horaFin > r.horaInicio
    );
  }, [solicitudCambio, reservasExistentes]);

  return (
    <ModalConfirmacion
      isOpen={!!solicitudCambio}
      title={`Confirmar cambio de estado a "${solicitudCambio?.nuevoEstado ?? ''}"`}
      description="Esta acción actualizará el estado de la reserva y la disponibilidad del ambiente"
      confirmText={`Sí, marcar como ${solicitudCambio?.nuevoEstado ?? ''}`}
      cancelText="Cancelar"
      variant={
        solicitudCambio?.nuevoEstado === 'Aprobada'
          ? 'success'
          : solicitudCambio?.nuevoEstado === 'Rechazada'
            ? 'danger'
            : 'primary'
      }
      isLoading={isLoading}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      {solicitudCambio && (
        <div className="space-y-3">
          <p className="text-slate-700 dark:text-slate-200">
            ¿Está seguro de cambiar el estado de la reserva para el ambiente{' '}
            <strong>{solicitudCambio.reserva.ambienteNombre}</strong> al estado{' '}
            <strong>{solicitudCambio.nuevoEstado}</strong>?
          </p>
          <div className="bg-slate-50 dark:bg-[#0F172A] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <p>
              <strong>Solicitante:</strong> {solicitudCambio.reserva.usuarioNombre}
            </p>
            <p className="tabular-nums">
              <strong>Fecha y Horario:</strong>{' '}
              {formatearFechaLegible(solicitudCambio.reserva.fecha)} (
              {formatearRangoHorario(
                solicitudCambio.reserva.horaInicio,
                solicitudCambio.reserva.horaFin
              )}
              )
            </p>
            <p>
              <strong>Motivo:</strong> {solicitudCambio.reserva.motivo}
            </p>
          </div>

          {solicitudCambio.nuevoEstado === 'Aprobada' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Al aprobar esta solicitud, el bloque horario quedará reservado en exclusiva para
                este ambiente universitario.
              </p>

              {otrasPendientesEnCruce.length > 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 flex items-start gap-2">
                  <TriangleAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      Aviso de cruce con {otrasPendientesEnCruce.length} solicitud(es) pendiente(s)
                    </p>
                    <p className="mt-0.5">
                      Existen otras solicitudes en espera para este mismo ambiente y horario (
                      {otrasPendientesEnCruce
                        .map((o) => `${o.usuarioNombre}: ${o.horaInicio}–${o.horaFin} h`)
                        .join(', ')}
                      ). Si aprueba esta reserva, esas solicitudes ya no podrán aprobarse en ese
                      bloque.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {solicitudCambio.nuevoEstado === 'Rechazada' && (
            <p className="text-xs font-semibold text-red-700 dark:text-rose-400">
              Atención: Una vez que una reserva es Rechazada, su estado es definitivo y ya no podrá
              modificarse posteriormente.
            </p>
          )}

          {solicitudCambio.nuevoEstado === 'Cancelada' && (
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              Reversión de reserva: Al cancelar esta solicitud, el bloque horario quedará libre de
              inmediato para nuevas programaciones.
            </p>
          )}
        </div>
      )}
    </ModalConfirmacion>
  );
}
