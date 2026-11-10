import type { ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AuthBrandPanel } from '../components/layout/AuthBrandPanel';
import { Tooltip } from '../components/ui';

export interface AuthLayoutProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  children: ReactNode;
}

export function AuthLayout({ isDark = false, onToggleTheme, children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh lg:h-dvh lg:max-h-dvh w-full flex flex-col lg:flex-row bg-white dark:bg-[#0F172A] lg:overflow-hidden transition-colors">
      {/* Encabezado móvil (< lg) con Logotipo Oficial UPLA */}
      <header className="lg:hidden bg-[#0B192C] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/25 bg-[#1264A3] flex items-center justify-center shrink-0">
            <img
              src="/images/upla-logo.jpg"
              alt="Logotipo oficial UPLA"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight block leading-none">
              ReservaUPLA
            </span>
            <span className="text-[11px] text-slate-300">Universidad Peruana Los Andes</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <Tooltip content="Alternar entre modo claro y oscuro" position="bottom">
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Alternar entre modo claro y oscuro"
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>
            </Tooltip>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-300/30">
            Acceso UPLA
          </span>
        </div>
      </header>

      {/* Panel Corporativo Izquierdo (60%) con Fotografía Institucional y Overlay */}
      <AuthBrandPanel />

      {/* Panel de Autenticación Derecho (40%) */}
      <main className="relative w-full lg:w-[42%] xl:w-[40%] bg-white dark:bg-[#0F172A] flex flex-col items-center justify-center px-6 sm:px-10 lg:px-10 xl:px-12 py-10 h-full overflow-y-auto scroll-thin transition-colors">
        {onToggleTheme && (
          <div className="hidden lg:block absolute top-5 right-5">
            <Tooltip content="Alternar entre modo claro y oscuro" position="left">
              <button
                type="button"
                onClick={onToggleTheme}
                aria-pressed={isDark}
                aria-label="Alternar entre modo claro y oscuro"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-[#1E3A8A]" />
                )}
              </button>
            </Tooltip>
          </div>
        )}
        <div className="w-full max-w-md flex flex-col">{children}</div>
      </main>
    </div>
  );
}
