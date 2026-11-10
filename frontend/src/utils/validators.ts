import type {
  CrearAmbientePayload,
  CrearReservaPayload,
  CrearUsuarioPayload,
  ErroresFormularioAmbiente,
  ErroresFormularioReserva,
  ErroresFormularioUsuario
} from '../types';
import { HORA_MAXIMA_INSTITUCIONAL, HORA_MINIMA_INSTITUCIONAL } from './constants';

export function validarFormularioReserva(payload: CrearReservaPayload): ErroresFormularioReserva {
  const errores: ErroresFormularioReserva = {};

  if (!payload.usuarioId) {
    errores.usuarioId = 'Seleccione el solicitante de la reserva.';
  }
  if (!payload.ambienteId) {
    errores.ambienteId = 'Seleccione el ambiente universitario.';
  }
  if (!payload.fecha) {
    errores.fecha = 'Ingrese la fecha programada de la reserva.';
  }
  if (!payload.horaInicio) {
    errores.horaInicio = 'Ingrese la hora de inicio.';
  }
  if (!payload.horaFin) {
    errores.horaFin = 'Ingrese la hora de término.';
  }
  if (!payload.motivo.trim() || payload.motivo.trim().length < 5) {
    errores.motivo = 'Describa el motivo académico o administrativo (mínimo 5 caracteres).';
  }

  if (payload.horaInicio && payload.horaFin) {
    if (payload.horaFin <= payload.horaInicio) {
      errores.horaFin = 'La hora de fin debe ser mayor que la hora de inicio.';
    }
    if (
      payload.horaInicio < HORA_MINIMA_INSTITUCIONAL ||
      payload.horaFin > HORA_MAXIMA_INSTITUCIONAL
    ) {
      const msgRango = 'El horario institucional permitido es de 07:00 a 22:00 h.';
      if (payload.horaInicio < HORA_MINIMA_INSTITUCIONAL) errores.horaInicio = msgRango;
      if (payload.horaFin > HORA_MAXIMA_INSTITUCIONAL) errores.horaFin = msgRango;
    }
  }

  return errores;
}

export function validarFormularioAmbiente(payload: CrearAmbientePayload): ErroresFormularioAmbiente {
  const errores: ErroresFormularioAmbiente = {};

  if (!payload.nombre.trim() || payload.nombre.trim().length < 3) {
    errores.nombre = 'El nombre del ambiente es obligatorio (mínimo 3 caracteres).';
  }
  if (!payload.tipo.trim()) {
    errores.tipo = 'Seleccione el tipo de ambiente.';
  }
  if (!payload.capacidad || Number.isNaN(payload.capacidad) || payload.capacidad <= 0) {
    errores.capacidad = 'La capacidad máxima debe ser mayor a 0.';
  }
  if (!payload.ubicacion.trim()) {
    errores.ubicacion = 'Indique el pabellón y piso del ambiente.';
  }

  return errores;
}

export function validarFormularioUsuario(payload: CrearUsuarioPayload): ErroresFormularioUsuario {
  const errores: ErroresFormularioUsuario = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!payload.nombreCompleto.trim() || payload.nombreCompleto.trim().length < 3) {
    errores.nombreCompleto = 'Ingrese los nombres y apellidos completos (mínimo 3 caracteres).';
  }
  if (!payload.correo.trim() || !emailRegex.test(payload.correo.trim())) {
    errores.correo = 'Ingrese un correo electrónico institucional o válido.';
  }

  return errores;
}
