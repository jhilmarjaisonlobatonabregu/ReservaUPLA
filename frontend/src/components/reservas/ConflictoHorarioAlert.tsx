import { TriangleAlert } from 'lucide-react';
import type { Reserva } from '../../types';

interface ConflictoHorarioAlertProps {
  conflicto: Reserva;
}

export function ConflictoHorarioAlert({ conflicto }: ConflictoHorarioAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl bg-rose-50 border border-rose-300 px-3.5 py-2.5 text-xs text-rose-900 flex items-start gap-2"
    >
      <TriangleAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">
          Restricción de Horario: Cruce detectado de {conflicto.horaInicio} a{' '}
          {conflicto.horaFin} h
        </p>
        <p className="mt-0.5">
          Este ambiente ya tiene una reserva aprobada en ese bloque ({conflicto.motivo}).
          Elija otro horario libre antes de registrar su solicitud.
        </p>
      </div>
    </div>
  );
}
