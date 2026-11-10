import { Building2, CalendarCheck2, CheckCircle2, MapPin, TriangleAlert, Users } from 'lucide-react';
import type { Ambiente, Reserva } from '../../types';
import { formatearFechaLegible } from '../../utils/formatters';

interface AmbienteFichaCardProps {
  ambiente: Ambiente;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horarioValido: boolean;
  conflictoEnTiempoReal: Reserva | null;
  reservasDelAmbienteEnFecha: Reserva[];
}

export function AmbienteFichaCard({
  ambiente,
  fecha,
  horaInicio,
  horaFin,
  horarioValido,
  conflictoEnTiempoReal,
  reservasDelAmbienteEnFecha
}: AmbienteFichaCardProps) {
  return (
    <div className="rounded-xl bg-slate-50/90 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400 shrink-0" />
          <span className="text-xs font-extrabold text-slate-900 dark:text-[#F8FAFC]">
            {ambiente.nombre}
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            ({ambiente.tipo})
          </span>
        </div>

        {/* Indicador en vivo del rango horario elegido */}
        {ambiente.estado !== 'Disponible' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <TriangleAlert className="w-3 h-3" />
            Ambiente en {ambiente.estado}
          </span>
        ) : conflictoEnTiempoReal ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
            <TriangleAlert className="w-3 h-3" />
            Ocupado de {conflictoEnTiempoReal.horaInicio} a {conflictoEnTiempoReal.horaFin} h
          </span>
        ) : horarioValido ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Horario Libre ({horaInicio} – {horaFin} h)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            Ajuste un rango entre 07:00 y 22:00 h
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Aforo máx.:{' '}
            <strong className="text-slate-900 dark:text-[#F8FAFC] tabular-nums">
              {ambiente.capacidad} personas
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:col-span-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            Ubicación:{' '}
            <strong className="text-slate-900 dark:text-[#F8FAFC]">
              {ambiente.ubicacion}
            </strong>
          </span>
        </div>
      </div>

      {/* Resumen de bloques ocupados ese mismo día para no depender de la memoria del usuario */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <CalendarCheck2 className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
          Agenda del {formatearFechaLegible(fecha)}:
        </span>
        {reservasDelAmbienteEnFecha.length === 0 ? (
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            Sin reservas registradas en esta fecha (100% libre)
          </span>
        ) : (
          reservasDelAmbienteEnFecha.map((r) => (
            <span
              key={r.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums border ${
                r.estado === 'Aprobada'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {r.horaInicio}–{r.horaFin} h ({r.estado})
            </span>
          ))
        )}
      </div>
    </div>
  );
}
