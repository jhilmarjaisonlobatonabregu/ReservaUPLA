import { useState } from 'react';
import { reservaService } from '../services';
import type {
  EstadoReserva,
  FeedbackAlert,
  Reserva,
  UserSession
} from '../types';
import { formatearFechaLegible } from '../utils/formatters';

interface UseReservaEstadoOptions {
  rolActivo: UserSession['rol'];
  cargarDatos: () => Promise<void>;
  setAlerta: (alert: FeedbackAlert | null) => void;
}

export function useReservaEstado({
  rolActivo,
  cargarDatos,
  setAlerta
}: UseReservaEstadoOptions) {
  const [modalCambioEstado, setModalCambioEstado] = useState<{
    reserva: Reserva;
    nuevoEstado: EstadoReserva;
  } | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState<boolean>(false);

  const handleConfirmarCambioEstado = async () => {
    if (!modalCambioEstado) return;
    setIsChangingStatus(true);
    setAlerta(null);

    try {
      const { reserva, nuevoEstado } = modalCambioEstado;
      const res = await reservaService.cambiarEstadoReserva(reserva.id, {
        nuevoEstado,
        rolActor: rolActivo
      });

      setAlerta({
        type: 'success',
        title: `Reserva actualizada al estado "${nuevoEstado}"`,
        message:
          res.mensaje ||
          res.message ||
          `La reserva en '${reserva.ambienteNombre}' (${formatearFechaLegible(reserva.fecha)}, ${reserva.horaInicio}–${reserva.horaFin} h) cambió exitosamente a '${nuevoEstado}'.`
      });
      setModalCambioEstado(null);
      await cargarDatos();
    } catch (err) {
      setAlerta({
        type: 'error',
        title: 'Operación no permitida',
        message: err instanceof Error ? err.message : 'No se pudo cambiar el estado.'
      });
      setModalCambioEstado(null);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return {
    modalCambioEstado,
    setModalCambioEstado,
    isChangingStatus,
    handleConfirmarCambioEstado
  };
}
