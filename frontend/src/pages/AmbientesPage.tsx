import { Building2, Eye, PlusCircle } from 'lucide-react';
import {
  AlertMessage,
  AmbienteFormCard,
  AmbienteTableSection,
  Button,
  PageHeader
} from '../components';
import { useAmbientesManagement } from '../hooks';
import type { UserSession } from '../types';

export interface AmbientesPageProps {
  session: UserSession;
}

export function AmbientesPage({ session }: AmbientesPageProps) {
  const {
    ambientes,
    isLoading,
    isSubmitting,
    isModalOpen,
    abrirModalRegistro,
    cerrarModalRegistro,
    limpiarFormulario,
    nombre,
    setNombre,
    tipo,
    setTipo,
    capacidad,
    setCapacidad,
    ubicacion,
    setUbicacion,
    estado,
    setEstado,
    errores,
    setErrores,
    alerta,
    setAlerta,
    handleRegistrar
  } = useAmbientesManagement();

  const esAdmin = session.rol === 'Administrador';
  const disponiblesCount = ambientes.filter((a) => a.estado === 'Disponible').length;
  const mantenimientoCount = ambientes.filter((a) => a.estado === 'Mantenimiento').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          esAdmin
            ? 'Catálogo y Registro de Ambientes Universitarios'
            : 'Supervisión de Ambientes Universitarios Asignados'
        }
        subtitle={
          esAdmin
            ? 'Registro y control de laboratorios de cómputo, auditorios, salas de reuniones y aulas especiales.'
            : 'Consulta de estado operativo, capacidad de aforo y total de reservas aprobadas por ambiente.'
        }
        badge={`${ambientes.length} ambientes`}
        actions={
          esAdmin ? (
            <Button
              variant="primary"
              onClick={abrirModalRegistro}
              tooltip="Abrir ventana modal para registrar un nuevo ambiente universitario"
              tooltipPosition="bottom"
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Registrar Ambiente
            </Button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900">
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              <span>Modo Supervisión de Responsable de Ambiente</span>
            </div>
          )
        }
      />

      {alerta && (
        <AlertMessage
          type={alerta.type}
          title={alerta.title}
          message={alerta.message}
          onClose={() => setAlerta(null)}
        />
      )}

      {/* Resumen rápido del estado de infraestructura */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-4 py-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Ambientes UPLA
            </p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tabular-nums mt-0.5">
              {ambientes.length}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Infraestructura
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-4 py-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ambientes Disponibles
            </p>
            <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
              {disponiblesCount}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Operativos
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-4 py-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              En Mantenimiento / Inactivos
            </p>
            <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400 tabular-nums mt-0.5">
              {mantenimientoCount + ambientes.filter((a) => a.estado === 'Inactivo').length}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Restringidos
          </span>
        </div>
      </div>

      {/* Tabla expandida al 100% del ancho disponible */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
              Catálogo General de Ambientes Universitarios
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Mostrando <strong>{ambientes.length}</strong> ambientes registrados
          </span>
        </div>

        <AmbienteTableSection
          ambientes={ambientes}
          isLoading={isLoading}
          onAbrirModalRegistro={esAdmin ? abrirModalRegistro : undefined}
        />
      </div>

      {/* Modal interactivo para registrar nuevo ambiente (exclusivo Administrador) */}
      {esAdmin && (
        <AmbienteFormCard
          isOpen={isModalOpen}
          onClose={cerrarModalRegistro}
          onLimpiar={limpiarFormulario}
          nombre={nombre}
          onNombreChange={(val) => {
            setNombre(val);
            if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: undefined }));
          }}
          tipo={tipo}
          onTipoChange={(val) => {
            setTipo(val);
            if (errores.tipo) setErrores((prev) => ({ ...prev, tipo: undefined }));
          }}
          capacidad={capacidad}
          onCapacidadChange={(val) => {
            setCapacidad(val);
            if (errores.capacidad) setErrores((prev) => ({ ...prev, capacidad: undefined }));
          }}
          ubicacion={ubicacion}
          onUbicacionChange={(val) => {
            setUbicacion(val);
            if (errores.ubicacion) setErrores((prev) => ({ ...prev, ubicacion: undefined }));
          }}
          estado={estado}
          onEstadoChange={setEstado}
          errores={errores}
          isSubmitting={isSubmitting}
          onSubmit={(e) => void handleRegistrar(e)}
        />
      )}
    </div>
  );
}
