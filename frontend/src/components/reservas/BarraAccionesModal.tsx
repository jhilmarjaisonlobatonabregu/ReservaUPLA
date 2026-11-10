import { CalendarPlus, RotateCcw, SearchCheck } from 'lucide-react';
import { Button, Tooltip } from '../ui';

interface BarraAccionesModalProps {
  esResponsable: boolean;
  isSubmitting: boolean;
  isCheckingDisp: boolean;
  onLimpiarFormulario: () => void;
  onVerificarDisponibilidad: () => void;
  onClose: () => void;
}

export function BarraAccionesModal({
  esResponsable,
  isSubmitting,
  isCheckingDisp,
  onLimpiarFormulario,
  onVerificarDisponibilidad,
  onClose
}: BarraAccionesModalProps) {
  return (
    <div className="pt-3.5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <Tooltip
          content="Restablecer los campos del formulario a sus valores iniciales"
          position="top"
        >
          <button
            type="button"
            onClick={onLimpiarFormulario}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar campos</span>
          </button>
        </Tooltip>

        <Button
          type="button"
          variant={esResponsable ? 'primary' : 'outline'}
          size="sm"
          onClick={onVerificarDisponibilidad}
          isLoading={isCheckingDisp}
          loadingText="Validando..."
          icon={<SearchCheck className="w-4 h-4" />}
          tooltip="Comprobar en el servidor si el ambiente tiene cruces en este rango horario"
        >
          Validar Disponibilidad
        </Button>
      </div>

      <div className="flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isSubmitting}
          tooltip="Descartar cambios y cerrar esta ventana (Esc)"
        >
          Cancelar
        </Button>

        {!esResponsable && (
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Procesando..."
            icon={<CalendarPlus className="w-4 h-4" />}
            tooltip="Registrar solicitud de reserva en estado Pendiente"
          >
            Registrar Solicitud
          </Button>
        )}
      </div>
    </div>
  );
}
