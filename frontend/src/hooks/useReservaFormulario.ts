import { useState } from 'react';
import type { FormEvent } from 'react';
import { reservaService } from '../services';
import type {
  Ambiente,
  DisponibilidadResponse,
  ErroresFormularioReserva,
  FeedbackAlert,
  UserSession
} from '../types';
import {
  HORA_MAXIMA_INSTITUCIONAL,
  HORA_MINIMA_INSTITUCIONAL
} from '../utils/constants';
import { formatearFechaLegible, obtenerFechaHoyIso } from '../utils/formatters';
import { validarFormularioReserva } from '../utils/validators';

interface UseReservaFormularioOptions {
  session: UserSession;
  ambientes: Ambiente[];
  cargarDatos: () => Promise<void>;
  setAlerta: (alert: FeedbackAlert | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

export function useReservaFormulario({
  session,
  ambientes,
  cargarDatos,
  setAlerta,
  setIsModalOpen
}: UseReservaFormularioOptions) {
  const hoyIso = obtenerFechaHoyIso();

  const [usuarioId, setUsuarioId] = useState<string>(session.id);
  const [ambienteId, setAmbienteId] = useState<string>('');
  const [fecha, setFecha] = useState<string>(hoyIso);
  const [horaInicio, setHoraInicio] = useState<string>('08:00');
  const [horaFin, setHoraFin] = useState<string>('10:00');
  const [motivo, setMotivo] = useState<string>('');
  const [erroresForm, setErroresForm] = useState<ErroresFormularioReserva>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingDisp, setIsCheckingDisp] = useState<boolean>(false);
  const [disponibilidadInfo, setDisponibilidadInfo] =
    useState<DisponibilidadResponse | null>(null);

  // Permite que el hook padre restablezca ambienteId al cargar la lista inicial
  const _setAmbienteId = setAmbienteId;
  const _setUsuarioId = setUsuarioId;

  const limpiarFormulario = () => {
    setFecha(hoyIso);
    setHoraInicio('08:00');
    setHoraFin('10:00');
    setMotivo('');
    setErroresForm({});
    setDisponibilidadInfo(null);
  };

  const aplicarBloqueHorarioRapido = (inicio: string, fin: string) => {
    setHoraInicio(inicio);
    setHoraFin(fin);
    setErroresForm((prev) => ({ ...prev, horaInicio: undefined, horaFin: undefined }));
    setDisponibilidadInfo(null);
  };

  const handleVerificarDisponibilidad = async () => {
    setAlerta(null);
    setDisponibilidadInfo(null);

    if (!ambienteId || !fecha || !horaInicio || !horaFin) {
      setErroresForm((prev) => ({
        ...prev,
        ambienteId: !ambienteId ? 'Seleccione un ambiente universitario.' : prev.ambienteId,
        fecha: !fecha ? 'Seleccione una fecha.' : prev.fecha,
        horaInicio: !horaInicio ? 'Ingrese la hora de inicio.' : prev.horaInicio,
        horaFin: !horaFin ? 'Ingrese la hora de fin.' : prev.horaFin
      }));
      return;
    }

    if (horaInicio < HORA_MINIMA_INSTITUCIONAL || horaInicio > HORA_MAXIMA_INSTITUCIONAL) {
      setErroresForm((prev) => ({
        ...prev,
        horaInicio: 'La hora de inicio debe estar entre las 07:00 y las 22:00 horas.'
      }));
      return;
    }

    if (horaFin < HORA_MINIMA_INSTITUCIONAL || horaFin > HORA_MAXIMA_INSTITUCIONAL) {
      setErroresForm((prev) => ({
        ...prev,
        horaFin: 'La hora de fin debe estar entre las 07:00 y las 22:00 horas.'
      }));
      return;
    }

    if (horaFin <= horaInicio) {
      setErroresForm((prev) => ({
        ...prev,
        horaFin: 'La hora de fin debe ser estrictamente mayor que la hora de inicio.'
      }));
      return;
    }

    setErroresForm((prev) => ({ ...prev, horaInicio: undefined, horaFin: undefined }));
    setIsCheckingDisp(true);
    try {
      const res = await reservaService.validarDisponibilidad(
        ambienteId,
        fecha,
        horaInicio,
        horaFin
      );
      const datos = res.datos ?? res.data ?? null;
      if (datos) {
        setDisponibilidadInfo(datos);
        if (!datos.disponible) {
          setErroresForm((prev) => ({
            ...prev,
            horaInicio: 'Este rango se cruza con una reserva aprobada. Elija otro horario.',
            horaFin: 'Ajuste la hora de fin o seleccione otro bloque disponible.'
          }));
        }
      }
    } catch (err) {
      setAlerta({
        type: 'error',
        title: 'Validación de disponibilidad',
        message: err instanceof Error ? err.message : 'Error al consultar disponibilidad.'
      });
    } finally {
      setIsCheckingDisp(false);
    }
  };

  const handleRegistrarReserva = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);

    if (session.rol === 'Responsable de ambiente') {
      setAlerta({
        type: 'error',
        title: 'Operación restringida por rol',
        message:
          'El rol Responsable de ambiente solo dispone de permisos de consulta de uso y disponibilidad.'
      });
      return;
    }

    const idSolicitanteFinal = session.rol === 'Solicitante' ? session.id : usuarioId;
    const payload = {
      fecha,
      horaInicio,
      horaFin,
      motivo: motivo.trim(),
      usuarioId: idSolicitanteFinal,
      ambienteId
    };

    const errores = validarFormularioReserva(payload);
    const ambienteElegido = ambientes.find((a) => a.id === ambienteId);
    if (ambienteElegido && ambienteElegido.estado !== 'Disponible') {
      errores.ambienteId = `El ambiente '${ambienteElegido.nombre}' está en estado '${ambienteElegido.estado}' y no admite reservas.`;
    }

    setErroresForm(errores);
    if (Object.keys(errores).length > 0) return;

    setIsSubmitting(true);
    try {
      const resultado = await reservaService.registrarReserva(payload);
      const nombreAmb = ambienteElegido?.nombre ?? 'el ambiente seleccionado';
      setAlerta({
        type: 'success',
        title: 'Solicitud de reserva registrada en estado Pendiente',
        message:
          resultado.mensaje ||
          resultado.message ||
          `Se registró la solicitud para '${nombreAmb}' el ${formatearFechaLegible(fecha)} (${horaInicio} – ${horaFin} h) en estado Pendiente.`
      });
      limpiarFormulario();
      setIsModalOpen(false);
      await cargarDatos();
    } catch (err) {
      const msgError = err instanceof Error ? err.message : 'Error al registrar reserva.';
      // Shneiderman Regla 5: Preservar todos los datos escritos y señalar únicamente el campo en conflicto
      if (
        msgError.toLowerCase().includes('conflicto') ||
        msgError.toLowerCase().includes('cruz') ||
        msgError.toLowerCase().includes('aprobada')
      ) {
        setErroresForm((prev) => ({
          ...prev,
          horaInicio: 'Conflicto de horario detectado en este ambiente.',
          horaFin: 'Seleccione otro bloque horario libre.'
        }));
      }
      setDisponibilidadInfo({
        disponible: false,
        mensaje: msgError,
        conflictos: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Estado del formulario
    usuarioId,
    setUsuarioId: _setUsuarioId,
    ambienteId,
    setAmbienteId: _setAmbienteId,
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
    disponibilidadInfo,
    setDisponibilidadInfo,
    // Handlers
    limpiarFormulario,
    aplicarBloqueHorarioRapido,
    handleVerificarDisponibilidad,
    handleRegistrarReserva
  };
}


