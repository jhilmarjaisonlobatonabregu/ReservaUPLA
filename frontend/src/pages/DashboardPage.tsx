import { useState } from 'react';
import { CalendarPlus, RefreshCw, SearchCheck } from 'lucide-react';
import {
  AlertMessage,
  Button,
  DashboardIndicadoresGrid,
  DashboardTablasSection,
  PageHeader,
  ReservaDetalleModal
} from '../components';
import { useDashboard } from '../hooks';
import type { Reserva, UserSession } from '../types';
import { DESCRIPCION_POR_ROL } from '../utils/constants';

export interface DashboardPageProps {
  session: UserSession;
  onIrAReservas: () => void;
}

export function DashboardPage({ session, onIrAReservas }: DashboardPageProps) {
  const { indicadores, isLoading, error, setError, cargarDashboard } = useDashboard(session);
  const [reservaDetalle, setReservaDetalle] = useState<Reserva | null>(null);

  const tituloDashboard =
    session.rol === 'Solicitante'
      ? 'Mi Dashboard Personal de Solicitudes y Reservas'
      : session.rol === 'Responsable de ambiente'
        ? 'Panel de Supervisión de Ocupación de Ambientes'
        : 'Dashboard Institucional de Indicadores Académicos';

  const subtituloDashboard =
    session.rol === 'Solicitante'
      ? 'Resumen exclusivo de sus solicitudes registradas, estados de aprobación y ambientes disponibles.'
      : session.rol === 'Responsable de ambiente'
        ? 'Monitoreo del uso, aforo, estado operativo y reservas programadas en los ambientes universitarios asignados.'
        : 'Consolidado institucional global de reservas registradas, pendientes, aprobadas, rechazadas y ambiente más utilizado.';

  return (
    <div className="space-y-5">
      <PageHeader
        title={tituloDashboard}
        subtitle={subtituloDashboard}
        badge={`Sesión: ${session.rol}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void cargarDashboard()}
              isLoading={isLoading}
              loadingText="Sincronizando..."
              tooltip="Sincronizar indicadores y tablas en tiempo real"
              tooltipPosition="bottom"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Actualizar indicadores
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onIrAReservas}
              tooltip={
                session.rol === 'Solicitante'
                  ? 'Abrir el módulo de solicitudes para registrar una nueva reserva'
                  : session.rol === 'Responsable de ambiente'
                    ? 'Consultar la agenda completa y verificar disponibilidad de ambientes'
                    : 'Ir al panel de control para aprobar o rechazar solicitudes pendientes'
              }
              tooltipPosition="bottom"
              icon={
                session.rol === 'Responsable de ambiente' ? (
                  <SearchCheck className="w-4 h-4" />
                ) : (
                  <CalendarPlus className="w-4 h-4" />
                )
              }
            >
              {session.rol === 'Solicitante'
                ? 'Nueva solicitud de reserva'
                : session.rol === 'Responsable de ambiente'
                  ? 'Consultar agenda y disponibilidad'
                  : 'Gestionar aprobaciones y reservas'}
            </Button>
          </>
        }
      />

      {/* Banner de contexto operativo según rol autenticado */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-5 py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
            Bienvenido(a), {session.nombreCompleto}{' '}
            <span className="text-slate-400 font-normal">({session.correo})</span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {DESCRIPCION_POR_ROL[session.rol]}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          {session.facultadDependencia}
        </span>
      </div>

      {error && (
        <AlertMessage
          type="error"
          title="Error al consultar indicadores"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <DashboardIndicadoresGrid
        session={session}
        indicadores={indicadores}
        onIrAReservas={onIrAReservas}
      />

      <DashboardTablasSection
        session={session}
        resumenPorAmbiente={indicadores?.resumenPorAmbiente ?? []}
        proximasReservas={indicadores?.proximasReservas ?? []}
        isLoading={isLoading}
        onIrAReservas={onIrAReservas}
        onVerDetalleReserva={setReservaDetalle}
      />

      <ReservaDetalleModal
        reserva={reservaDetalle}
        onClose={() => setReservaDetalle(null)}
      />
    </div>
  );
}
