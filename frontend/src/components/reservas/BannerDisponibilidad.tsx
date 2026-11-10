import { AlertMessage } from '../ui';
import type { DisponibilidadResponse } from '../../types';

interface BannerDisponibilidadProps {
  disponibilidadInfo: DisponibilidadResponse;
  onClose: () => void;
}

export function BannerDisponibilidad({ disponibilidadInfo, onClose }: BannerDisponibilidadProps) {
  return (
    <AlertMessage
      type={disponibilidadInfo.disponible ? 'success' : 'warning'}
      title={
        disponibilidadInfo.disponible
          ? 'Ambiente Disponible en el Rango Consultado'
          : 'Conflicto de Horario Detectado'
      }
      message={disponibilidadInfo.mensaje}
      details={disponibilidadInfo.conflictos.map(
        (c) =>
          `Reserva ${c.estado} de ${c.horaInicio} a ${c.horaFin} h — Solicitante: ${c.solicitante} (${c.motivo})`
      )}
      onClose={onClose}
    />
  );
}
