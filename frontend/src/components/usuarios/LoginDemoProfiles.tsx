import { ShieldCheck, Sparkles, UserCheck, Eye } from 'lucide-react';
import { Tooltip } from '../ui';
import { CUENTAS_INSTITUCIONALES_DEMO } from '../../utils/constants';
import type { DemoAccountOption } from '../../types';

export interface LoginDemoProfilesProps {
  correoSeleccionado: string;
  onSelectAccount: (cuenta: DemoAccountOption) => void;
}

export function LoginDemoProfiles({
  correoSeleccionado,
  onSelectAccount
}: LoginDemoProfilesProps) {
  const iconoPorRol = (rol: DemoAccountOption['rol']) => {
    if (rol === 'Administrador') return <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />;
    if (rol === 'Responsable de ambiente') return <Eye className="w-3.5 h-3.5 text-indigo-700" />;
    return <UserCheck className="w-3.5 h-3.5 text-emerald-700" />;
  };

  const badgePorRol = (rol: DemoAccountOption['rol']) => {
    if (rol === 'Administrador') return 'bg-blue-50 text-[#1E3A8A] border-blue-200';
    if (rol === 'Responsable de ambiente') return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  };

  return (
    <section className="mt-8" aria-label="Acceso rápido de demostración">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Acceso rápido de demostración
        </p>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
      </div>
      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mb-3">
        Haga clic en una cuenta para autocompletar el correo y la credencial.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CUENTAS_INSTITUCIONALES_DEMO.map((cuenta) => {
          const activa =
            correoSeleccionado.trim().toLowerCase() === cuenta.correo.toLowerCase();
          return (
            <Tooltip
              key={cuenta.id}
              content={`Cargar credenciales de ${cuenta.nombreCompleto} (${cuenta.rol})`}
              position="top"
              className="flex w-full"
            >
              <button
                type="button"
                onClick={() => onSelectAccount(cuenta)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                  activa
                    ? 'bg-blue-50/90 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/15 shadow-2xs'
                    : 'bg-white dark:bg-[#0F172A] border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgePorRol(
                      cuenta.rol
                    )}`}
                  >
                    {iconoPorRol(cuenta.rol)}
                    {cuenta.rol}
                  </span>
                </div>
                <p
                  className={`text-xs font-bold truncate mt-0.5 ${
                    activa ? 'text-slate-900' : 'text-slate-900 dark:text-[#F8FAFC]'
                  }`}
                >
                  {cuenta.nombreCompleto}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {cuenta.correo}
                </p>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}
