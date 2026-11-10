import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Clock,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  UserCheck
} from 'lucide-react';
import { Tooltip } from '../ui';
import type { ModuloSistema, UserSession } from '../../types';
import { BREADCRUMB_POR_MODULO } from '../../utils/constants';
import { obtenerIniciales } from '../../utils/formatters';

export interface HeaderProps {
  session: UserSession;
  moduloActivo: ModuloSistema;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onRequestLogout: () => void;
}

export function Header({
  session,
  moduloActivo,
  isDark,
  onToggleTheme,
  onToggleSidebar,
  onRequestLogout
}: HeaderProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const breadcrumb = BREADCRUMB_POR_MODULO[moduloActivo];

  useEffect(() => {
    if (!menuAbierto) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuAbierto]);

  const badgePorRol =
    session.rol === 'Administrador'
      ? 'bg-blue-50 text-[#1E3A8A] border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
      : session.rol === 'Responsable de ambiente'
        ? 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40'
        : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40';

  const alcancePorRol =
    session.rol === 'Administrador'
      ? 'Alcance: Institucional Global'
      : session.rol === 'Responsable de ambiente'
        ? 'Alcance: Ambientes Asignados'
        : 'Alcance: Mis Solicitudes Personales';

  return (
    <header className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 shadow-2xs shrink-0 z-20 transition-colors">
      {/* Izquierda: Botón móvil + Breadcrumbs contextuales ("Estás aquí" — Heurística 1 de Nielsen) */}
      <div className="flex items-center gap-3 min-w-0">
        <Tooltip content="Abrir menú lateral de navegación" position="bottom">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Abrir menú de navegación"
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">{breadcrumb.section}</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">/</span>
            <span className="font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
              {breadcrumb.page}
            </span>
            <span
              className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgePorRol}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
              {alcancePorRol}
            </span>
          </div>
        </div>
      </div>

      {/* Derecha: Horario institucional + Interruptor de Modo (Sol/Luna) + Perfil */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <Tooltip
          content="Rango horario habilitado para reservas de ambientes universitarios"
          position="bottom"
        >
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#3B82F6]" aria-hidden="true" />
            <span>Horario institucional:</span>
            <strong className="font-bold text-slate-900 dark:text-[#F8FAFC] tabular-nums">
              07:00 – 22:00 h
            </strong>
          </div>
        </Tooltip>

        {/* Interruptor de Modo Claro / Oscuro con Tooltip flotante accesible */}
        <Tooltip content="Alternar entre modo claro y oscuro" position="bottom">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={isDark}
            aria-label="Alternar entre modo claro y oscuro"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer select-none shadow-2xs"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline text-xs font-bold">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#1E3A8A] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline text-xs font-bold">Modo Oscuro</span>
              </>
            )}
          </button>
        </Tooltip>

        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Perfil de Sesión Activa */}
        <div className="relative" ref={dropdownRef}>
          <Tooltip content="Ver datos de la cuenta activa y cerrar sesión" position="bottom">
            <button
              type="button"
              onClick={() => setMenuAbierto((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                menuAbierto
                  ? 'bg-slate-100 dark:bg-[#0F172A] border-slate-300 dark:border-slate-600 shadow-2xs'
                  : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#0F172A]'
              }`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1E3A8A] dark:bg-[#3B82F6] text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs">
                {obtenerIniciales(session.nombreCompleto)}
              </div>

              <div className="flex flex-col text-left max-w-[130px] sm:max-w-[190px]">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] leading-tight truncate">
                  {session.nombreCompleto}
                </span>
                <span className="text-[11px] font-semibold text-[#1E3A8A] dark:text-blue-400 leading-tight truncate">
                  {session.rol}
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                  menuAbierto ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          </Tooltip>

          {menuAbierto && (
            <div
              role="menu"
              aria-label="Opciones de cuenta institucional"
              className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50"
            >
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgePorRol}`}
                  >
                    {session.rol === 'Administrador' ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <UserCheck className="w-3 h-3" />
                    )}
                    {session.rol}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    Ingreso: {session.loginTimestamp}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                  {session.nombreCompleto}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {session.correo}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {session.facultadDependencia}
                </p>
              </div>

              <div className="pt-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuAbierto(false);
                    onRequestLogout();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Cerrar sesión institucional</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
