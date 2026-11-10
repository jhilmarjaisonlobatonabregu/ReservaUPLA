import { useState } from 'react';
import { useTheme } from './hooks';
import { MainLayout } from './layouts/MainLayout';
import { AmbientesPage } from './pages/AmbientesPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ReservasPage } from './pages/ReservasPage';
import { UsuariosPage } from './pages/UsuariosPage';
import type { ModuloSistema, UserSession } from './types';
import { MODULOS_PERMITIDOS_POR_ROL, SESSION_STORAGE_KEY } from './utils/constants';

function cargarSesionInicial(): UserSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    if (parsed && parsed.id && parsed.correo && parsed.rol) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function App() {
  const { isDark, toggleTheme } = useTheme();
  const [session, setSession] = useState<UserSession | null>(() => cargarSesionInicial());
  const [moduloActivo, setModuloActivo] = useState<ModuloSistema>('dashboard');

  function handleLoginSuccess(nuevaSesion: UserSession) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nuevaSesion));
    setSession(nuevaSesion);
    setModuloActivo('dashboard');
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setModuloActivo('dashboard');
  }

  function handleCambiarModulo(modulo: ModuloSistema) {
    if (!session) return;
    const permitidos = MODULOS_PERMITIDOS_POR_ROL[session.rol];
    if (!permitidos.includes(modulo)) {
      setModuloActivo('dashboard');
      return;
    }
    setModuloActivo(modulo);
  }

  if (!session) {
    return (
      <LoginPage
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const modulosPermitidos = MODULOS_PERMITIDOS_POR_ROL[session.rol];
  const moduloSeguro: ModuloSistema = modulosPermitidos.includes(moduloActivo)
    ? moduloActivo
    : 'dashboard';

  return (
    <MainLayout
      session={session}
      moduloActivo={moduloSeguro}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      onCambiarModulo={handleCambiarModulo}
      onLogout={handleLogout}
    >
      {moduloSeguro === 'dashboard' && (
        <DashboardPage
          session={session}
          onIrAReservas={() => handleCambiarModulo('reservas')}
        />
      )}
      {moduloSeguro === 'reservas' && <ReservasPage session={session} />}
      {moduloSeguro === 'ambientes' && modulosPermitidos.includes('ambientes') && (
        <AmbientesPage session={session} />
      )}
      {moduloSeguro === 'usuarios' && session.rol === 'Administrador' && <UsuariosPage />}
    </MainLayout>
  );
}

export default App;
