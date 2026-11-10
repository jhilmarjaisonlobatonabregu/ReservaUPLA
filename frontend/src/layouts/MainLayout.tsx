import { useState } from 'react';
import type { ReactNode } from 'react';
import { Header, PageContainer, Sidebar } from '../components/layout';
import { ModalConfirmacion } from '../components/ui';
import type { ModuloSistema, UserSession } from '../types';

export interface MainLayoutProps {
  session: UserSession;
  moduloActivo: ModuloSistema;
  isDark: boolean;
  onToggleTheme: () => void;
  onCambiarModulo: (modulo: ModuloSistema) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function MainLayout({
  session,
  moduloActivo,
  isDark,
  onToggleTheme,
  onCambiarModulo,
  onLogout,
  children
}: MainLayoutProps) {
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F5F9] dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] transition-colors">
      <Sidebar
        session={session}
        moduloActivo={moduloActivo}
        onCambiarModulo={onCambiarModulo}
        onRequestLogout={() => setLogoutModalOpen(true)}
        isOpenMobile={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          session={session}
          moduloActivo={moduloActivo}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onToggleSidebar={() => setSidebarMobileOpen((prev) => !prev)}
          onRequestLogout={() => setLogoutModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto w-full scroll-thin">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>

      <ModalConfirmacion
        isOpen={logoutModalOpen}
        title="Cerrar sesión institucional"
        description="Finalizar la sesión activa en ReservaUPLA"
        confirmText="Sí, cerrar sesión"
        cancelText="Seguir en el sistema"
        variant="danger"
        onConfirm={() => {
          setLogoutModalOpen(false);
          onLogout();
        }}
        onClose={() => setLogoutModalOpen(false)}
      >
        <p className="text-slate-700 dark:text-slate-200">
          ¿Está seguro de que desea cerrar la sesión de{' '}
          <strong>{session.nombreCompleto}</strong> ({session.rol})?
        </p>
      </ModalConfirmacion>
    </div>
  );
}
