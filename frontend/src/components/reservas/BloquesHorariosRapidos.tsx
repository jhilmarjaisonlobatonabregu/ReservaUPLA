import { Zap } from 'lucide-react';
import { Tooltip } from '../ui';
import { BLOQUES_HORARIOS_RAPIDOS } from '../../utils/constants';

interface BloquesHorariosRapidosProps {
  horaInicio: string;
  horaFin: string;
  onAplicarBloque: (inicio: string, fin: string) => void;
}

export function BloquesHorariosRapidos({
  horaInicio,
  horaFin,
  onAplicarBloque
}: BloquesHorariosRapidosProps) {
  return (
    <div className="pt-0.5">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span>Atajos de bloques académicos (07:00 – 22:00 h):</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BLOQUES_HORARIOS_RAPIDOS.map((b) => {
          const activo = horaInicio === b.inicio && horaFin === b.fin;
          return (
            <Tooltip
              key={b.label}
              content={`Seleccionar bloque de ${b.inicio} a ${b.fin} horas`}
              position="top"
            >
              <button
                type="button"
                onClick={() => onAplicarBloque(b.inicio, b.fin)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tabular-nums border transition-all cursor-pointer ${
                  activo
                    ? 'bg-[#1E3A8A] dark:bg-[#3B82F6] text-white border-[#1E3A8A] dark:border-[#3B82F6] shadow-2xs'
                    : 'bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {b.label}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
