import type { EstadoAmbiente } from './ambiente';
import type { Reserva } from './reserva';

export interface UsoAmbiente {
  ambienteId: string;
  ambienteNombre: string;
  tipo: string;
  ubicacion: string;
  capacidad: number;
  estadoAmbiente: EstadoAmbiente;
  totalSolicitudes: number;
  reservasAprobadas: number;
  reservasPendientes: number;
}

export interface DashboardIndicadores {
  totalReservas: number;
  reservasPendientes: number;
  reservasAprobadas: number;
  reservasRechazadas: number;
  reservasCanceladas: number;
  ambienteMasUtilizado: string;
  usosAmbienteMasUtilizado: number;
  tipoAmbienteMasUtilizado: string;
  resumenPorAmbiente: UsoAmbiente[];
  proximasReservas: Reserva[];
}
