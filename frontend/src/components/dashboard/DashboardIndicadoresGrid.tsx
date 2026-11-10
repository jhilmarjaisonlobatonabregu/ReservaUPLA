import {
  Award,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { CardIndicador } from '../ui';
import type { DashboardIndicadores, UserSession } from '../../types';

export interface DashboardIndicadoresGridProps {
  session: UserSession;
  indicadores: DashboardIndicadores | null;
  onIrAReservas: () => void;
}

export function DashboardIndicadoresGrid({
  session,
  indicadores,
  onIrAReservas
}: DashboardIndicadoresGridProps) {
  const esSolicitante = session.rol === 'Solicitante';
  const esResponsable = session.rol === 'Responsable de ambiente';

  if (esSolicitante) {
    return (
      <section aria-label="Indicadores personales de mis reservas">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <CardIndicador
            title="Mis Reservas Totales"
            value={indicadores?.totalReservas ?? 0}
            subtitle="Solicitudes registradas por mí"
            badgeText="Personal"
            tone="blue"
            onClick={onIrAReservas}
            icon={<CalendarCheck className="w-5 h-5" />}
          />

          <CardIndicador
            title="Mis Reservas Pendientes"
            value={indicadores?.reservasPendientes ?? 0}
            subtitle="En evaluación por Administración"
            badgeText="En espera"
            tone="amber"
            onClick={onIrAReservas}
            icon={<Clock className="w-5 h-5" />}
          />

          <CardIndicador
            title="Mis Reservas Aprobadas"
            value={indicadores?.reservasAprobadas ?? 0}
            subtitle="Horarios confirmados a mi favor"
            badgeText="Confirmadas"
            tone="emerald"
            onClick={onIrAReservas}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />

          <CardIndicador
            title="Mis Reservas Rechazadas"
            value={indicadores?.reservasRechazadas ?? 0}
            subtitle="Estado definitivo"
            badgeText="Inmutable"
            tone="red"
            onClick={onIrAReservas}
            icon={<XCircle className="w-5 h-5" />}
          />

          <CardIndicador
            title="Ambiente más solicitado"
            value={indicadores?.ambienteMasUtilizado ?? 'Sin registros'}
            subtitle={
              indicadores
                ? `${indicadores.usosAmbienteMasUtilizado} solicitud(es) • ${indicadores.tipoAmbienteMasUtilizado}`
                : 'Mi preferencia'
            }
            badgeText="Frecuente"
            tone="indigo"
            onClick={onIrAReservas}
            icon={<Award className="w-5 h-5" />}
          />
        </div>
      </section>
    );
  }

  if (esResponsable) {
    const totalAmbientes = indicadores?.resumenPorAmbiente.length ?? 0;
    const ambientesDisponibles =
      indicadores?.resumenPorAmbiente.filter((a) => a.estadoAmbiente === 'Disponible').length ?? 0;

    return (
      <section aria-label="Indicadores de supervisión de ambientes asignados">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <CardIndicador
            title="Ambientes Asignados"
            value={totalAmbientes}
            subtitle={`${ambientesDisponibles} disponibles para uso`}
            badgeText="Supervisión"
            tone="blue"
            onClick={onIrAReservas}
            icon={<Building2 className="w-5 h-5" />}
          />

          <CardIndicador
            title="Reservas Aprobadas"
            value={indicadores?.reservasAprobadas ?? 0}
            subtitle="Bloques horarios ocupados"
            badgeText="Ocupación"
            tone="emerald"
            onClick={onIrAReservas}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />

          <CardIndicador
            title="Solicitudes Pendientes"
            value={indicadores?.reservasPendientes ?? 0}
            subtitle="En espera en ambientes a cargo"
            badgeText="Por resolver"
            tone="amber"
            onClick={onIrAReservas}
            icon={<Clock className="w-5 h-5" />}
          />

          <CardIndicador
            title="Total Eventos en Agenda"
            value={indicadores?.totalReservas ?? 0}
            subtitle="Histórico de solicitudes registradas"
            badgeText="Trazabilidad"
            tone="blue"
            onClick={onIrAReservas}
            icon={<CalendarCheck className="w-5 h-5" />}
          />

          <CardIndicador
            title="Ambiente más utilizado"
            value={indicadores?.ambienteMasUtilizado ?? 'Sin registros'}
            subtitle={
              indicadores
                ? `${indicadores.usosAmbienteMasUtilizado} reserva(s) • ${indicadores.tipoAmbienteMasUtilizado}`
                : 'Mayor demanda'
            }
            badgeText="Mayor uso"
            tone="indigo"
            onClick={onIrAReservas}
            icon={<Award className="w-5 h-5" />}
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Indicadores institucionales globales de reservas">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <CardIndicador
          title="Total de reservas"
          value={indicadores?.totalReservas ?? 0}
          subtitle="Consolidado institucional UPLA"
          badgeText="Global"
          tone="blue"
          onClick={onIrAReservas}
          icon={<CalendarCheck className="w-5 h-5" />}
        />

        <CardIndicador
          title="Reservas pendientes"
          value={indicadores?.reservasPendientes ?? 0}
          subtitle="Por evaluar"
          badgeText="En espera"
          tone="amber"
          onClick={onIrAReservas}
          icon={<Clock className="w-5 h-5" />}
        />

        <CardIndicador
          title="Reservas aprobadas"
          value={indicadores?.reservasAprobadas ?? 0}
          subtitle="Horarios bloqueados"
          badgeText="Confirmadas"
          tone="emerald"
          onClick={onIrAReservas}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />

        <CardIndicador
          title="Reservas rechazadas"
          value={indicadores?.reservasRechazadas ?? 0}
          subtitle="Estado inmutable"
          badgeText="Definitivo"
          tone="red"
          onClick={onIrAReservas}
          icon={<XCircle className="w-5 h-5" />}
        />

        <CardIndicador
          title="Ambiente más utilizado"
          value={indicadores?.ambienteMasUtilizado ?? 'Cargando...'}
          subtitle={
            indicadores
              ? `${indicadores.usosAmbienteMasUtilizado} reserva(s) • ${indicadores.tipoAmbienteMasUtilizado}`
              : 'Mayor demanda'
          }
          badgeText="Top UPLA"
          tone="indigo"
          onClick={onIrAReservas}
          icon={<Award className="w-5 h-5" />}
        />
      </div>
    </section>
  );
}
