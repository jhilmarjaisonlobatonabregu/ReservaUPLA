import { Building2, MapPin, PlusCircle, Users } from 'lucide-react';
import { Button, TableList, type TableColumn } from '../ui';
import type { Ambiente } from '../../types';

export interface AmbienteTableSectionProps {
  ambientes: Ambiente[];
  isLoading: boolean;
  onAbrirModalRegistro?: () => void;
}

export function AmbienteTableSection({
  ambientes,
  isLoading,
  onAbrirModalRegistro
}: AmbienteTableSectionProps) {
  const columnas: TableColumn<Ambiente>[] = [
    {
      key: 'nombre',
      header: 'Nombre del Ambiente',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-200 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.nombre}</p>
            <p className="text-xs text-slate-500">{row.tipo}</p>
          </div>
        </div>
      )
    },
    {
      key: 'ubicacion',
      header: 'Ubicación Física',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.ubicacion}</span>
        </span>
      )
    },
    {
      key: 'capacidad',
      header: 'Aforo / Capacidad',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-slate-800">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {row.capacidad} pers.
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado Operativo',
      align: 'center',
      render: (row) => {
        const badge =
          row.estado === 'Disponible'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : row.estado === 'Mantenimiento'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-100 text-slate-700 border-slate-300';
        return (
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border cursor-default select-none ${badge}`}
          >
            {row.estado}
          </span>
        );
      }
    },
    {
      key: 'reservas',
      header: 'Reservas Aprobadas',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-0.5 rounded-md bg-blue-50 text-[#1E3A8A] font-bold tabular-nums">
          {row.totalReservasAprobadas}
        </span>
      )
    }
  ];

  return (
    <section className="w-full">
      <TableList
        columns={columnas}
        data={ambientes}
        rowKey={(a) => a.id}
        isLoading={isLoading}
        emptyTitle="No hay ambientes registrados"
        emptyDescription="Utilice el botón inferior o el de la esquina superior derecha para incorporar un ambiente al catálogo."
        emptyAction={
          onAbrirModalRegistro ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onAbrirModalRegistro}
              icon={<PlusCircle className="w-4 h-4" />}
              tooltip="Abrir ventana modal para registrar un ambiente universitario"
            >
              Registrar Ambiente
            </Button>
          ) : undefined
        }
      />
    </section>
  );
}
