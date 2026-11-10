import { useEffect } from 'react';
import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';
import { Tooltip } from '../ui';
import type { ModuloSistema, UserSession } from '../../types';
import {
  MODULOS_PERMITIDOS_POR_ROL,
  PERMISOS_RESUMEN_POR_ROL
} from '../../utils/constants';

export interface SidebarProps {
  session: UserSession;
  moduloActivo: ModuloSistema;
  onCambiarModulo: (modulo: ModuloSistema) => void;
  onRequestLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  session,
  moduloActivo,
  onCambiarModulo,
  onRequestLogout,
  isOpenMobile,
  onCloseMobile
}: SidebarProps) {
  useEffect(() => {
    if (!isOpenMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  const modulosPermitidos = MODULOS_PERMITIDOS_POR_ROL[session.rol];

  const todosLosModulos: {
    id: ModuloSistema;
    label: string;
    subtitle: string;
    tooltip: string;
    Icon: typeof LayoutDashboard;
  }[] = [
    {
      id: 'dashboard',
      label:
        session.rol === 'Solicitante'
          ? 'Mi Dashboard'
          : session.rol === 'Responsable de ambiente'
            ? 'Ocupación y Uso'
            : 'Dashboard General',
      subtitle:
        session.rol === 'Solicitante'
          ? 'Resumen de mis solicitudes'
          : session.rol === 'Responsable de ambiente'
            ? 'Supervisión de ambientes'
            : 'Indicadores y ocupación',
      tooltip: 'Ver indicadores clave y estado actual de reservas',
      Icon: LayoutDashboard
    },
    {
      id: 'reservas',
      label:
        session.rol === 'Solicitante'
          ? 'Mis Solicitudes'
          : session.rol === 'Responsable de ambiente'
            ? 'Agenda y Disponibilidad'
            : 'Gestión de Reservas',
      subtitle:
        session.rol === 'Administrador'
          ? 'Aprobación y control de estados'
          : session.rol === 'Responsable de ambiente'
            ? 'Consulta de uso y horarios'
            : 'Nueva solicitud y seguimiento',
      tooltip: 'Gestionar solicitudes, filtrar horarios y validar disponibilidad',
      Icon: CalendarCheck2
    },
    {
      id: 'ambientes',
      label:
        session.rol === 'Responsable de ambiente'
          ? 'Ambientes Asignados'
          : 'Catálogo de Ambientes',
      subtitle:
        session.rol === 'Administrador'
          ? 'Registro y control de espacios'
          : 'Consulta de estado y aforo',
      tooltip: 'Consultar laboratorios, auditorios, ubicación y capacidad máxima',
      Icon: Building2
    },
    {
      id: 'usuarios',
      label: 'Padrón de Usuarios',
      subtitle: 'Cuentas institucionales UPLA',
      tooltip: 'Administrar cuentas de Solicitantes, Responsables y Administradores',
      Icon: Users
    }
  ];

  const navItems = todosLosModulos.filter((item) => modulosPermitidos.includes(item.id));
  const permisosRol = PERMISOS_RESUMEN_POR_ROL[session.rol];

  const handleSelect = (id: ModuloSistema) => {
    onCambiarModulo(id);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Menú lateral de navegación"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-68 xl:w-72 bg-[#0B192C] text-white h-full p-4 xl:p-5 flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-xl select-none transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div>
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/25 bg-[#1264A3] flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src="/images/upla-logo.jpg"
                  alt="Logotipo oficial UPLA"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    ReservaUPLA
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-300/30">
                    UPLA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Gestión de Ambientes
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Cerrar menú lateral"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación Principal adaptada al Actor */}
          <div className="mt-5">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              Menú de {session.rol}
            </p>
            <nav className="space-y-1.5">
              {navItems.map(({ id, label, subtitle, tooltip, Icon }) => {
                const activo = moduloActivo === id;
                return (
                  <Tooltip key={id} content={tooltip} position="right" className="block w-full">
                    <button
                      type="button"
                      onClick={() => handleSelect(id)}
                      aria-current={activo ? 'page' : undefined}
                      className={`w-full text-left px-3.5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                        activo
                          ? 'bg-[#1E3A8A] text-white shadow-md border border-blue-400/30'
                          : 'text-slate-300 hover:bg-white/[0.07] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-5 h-5 shrink-0 ${
                            activo ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold leading-tight truncate">{label}</p>
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              activo ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      {activo && (
                        <span
                          className="w-2 h-2 rounded-full bg-amber-300 shrink-0 shadow-xs"
                          title="Módulo activo actual"
                        />
                      )}
                    </button>
                  </Tooltip>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tarjeta inferior de permisos del rol autenticado y cierre de sesión */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold text-white truncate">
                Perfil: {session.rol}
              </span>
            </div>
            <ul className="space-y-1">
              {permisosRol.map((permiso, idx) => (
                <li
                  key={idx}
                  className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{permiso}</span>
                </li>
              ))}
            </ul>
          </div>

          <Tooltip
            content="Finalizar la sesión actual y regresar a la pantalla de acceso"
            position="top"
            className="block w-full"
          >
            <button
              type="button"
              onClick={onRequestLogout}
              className="w-full px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-400/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión institucional</span>
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
}
