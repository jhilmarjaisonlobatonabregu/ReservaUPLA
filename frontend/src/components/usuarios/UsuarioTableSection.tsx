import { Mail, UserPlus } from 'lucide-react';
import { Button, TableList, type TableColumn } from '../ui';
import type { Usuario } from '../../types';
import { obtenerIniciales } from '../../utils/formatters';

export interface UsuarioTableSectionProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onAbrirModalRegistro?: () => void;
}

export function UsuarioTableSection({
  usuarios,
  isLoading,
  onAbrirModalRegistro
}: UsuarioTableSectionProps) {
  const columnas: TableColumn<Usuario>[] = [
    {
      key: 'nombre',
      header: 'Nombre Completo',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-200 font-bold text-xs flex items-center justify-center shrink-0">
            {obtenerIniciales(row.nombreCompleto)}
          </div>
          <span className="font-bold text-slate-900">{row.nombreCompleto}</span>
        </div>
      )
    },
    {
      key: 'correo',
      header: 'Correo Institucional',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.correo}</span>
        </span>
      )
    },
    {
      key: 'rol',
      header: 'Actor / Rol en el Sistema',
      align: 'center',
      render: (row) => {
        const badge =
          row.rol === 'Administrador'
            ? 'bg-blue-50 text-blue-800 border-blue-300'
            : row.rol === 'Responsable de ambiente'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300';
        return (
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${badge}`}
          >
            {row.rol}
          </span>
        );
      }
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (row) => (
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold ${
            row.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'reservas',
      header: 'Solicitudes Realizadas',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-0.5 rounded-md bg-slate-100 font-bold tabular-nums text-slate-800">
          {row.totalReservas}
        </span>
      )
    }
  ];

  return (
    <section className="w-full">
      <TableList
        columns={columnas}
        data={usuarios}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        emptyTitle="No hay usuarios registrados en el padrón"
        emptyDescription="Utilice el botón inferior o el de la esquina superior derecha para incorporar un usuario."
        emptyAction={
          onAbrirModalRegistro ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onAbrirModalRegistro}
              icon={<UserPlus className="w-4 h-4" />}
              tooltip="Abrir ventana modal para registrar un nuevo usuario"
            >
              Nuevo Usuario
            </Button>
          ) : undefined
        }
      />
    </section>
  );
}
