import { UserPlus, Users } from 'lucide-react';
import {
  AlertMessage,
  Button,
  PageHeader,
  UsuarioFormCard,
  UsuarioTableSection
} from '../components';
import { useUsuariosManagement } from '../hooks';

export function UsuariosPage() {
  const {
    usuarios,
    isLoading,
    isSubmitting,
    isModalOpen,
    abrirModalRegistro,
    cerrarModalRegistro,
    limpiarFormulario,
    nombreCompleto,
    setNombreCompleto,
    correo,
    setCorreo,
    rol,
    setRol,
    errores,
    setErrores,
    alerta,
    setAlerta,
    handleRegistrar
  } = useUsuariosManagement();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Padrón Institucional de Usuarios y Actores"
        subtitle="Gestión de cuentas para los 3 actores del sistema: Solicitante, Responsable de ambiente y Administrador."
        badge={`${usuarios.length} usuarios registrados`}
        actions={
          <Button
            variant="primary"
            onClick={abrirModalRegistro}
            tooltip="Abrir ventana modal para registrar un nuevo usuario en el padrón"
            tooltipPosition="bottom"
            icon={<UserPlus className="w-4 h-4" />}
          >
            Nuevo Usuario
          </Button>
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

      {/* Resumen rápido de actores registrados por rol */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-4 py-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Actores Solicitantes
            </p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tabular-nums mt-0.5">
              {usuarios.filter((u) => u.rol === 'Solicitante').length}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Solicitante
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-4 py-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Responsables de Ambiente
            </p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tabular-nums mt-0.5">
              {usuarios.filter((u) => u.rol === 'Responsable de ambiente').length}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            Responsable de ambiente
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 px-4 py-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Administradores del Sistema
            </p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tabular-nums mt-0.5">
              {usuarios.filter((u) => u.rol === 'Administrador').length}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Administrador
          </span>
        </div>
      </div>

      {/* Tabla expandida al 100% del ancho disponible */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
              Listado General de Usuarios Registrados
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Total: <strong>{usuarios.length}</strong> registros activos
          </span>
        </div>

        <UsuarioTableSection
          usuarios={usuarios}
          isLoading={isLoading}
          onAbrirModalRegistro={abrirModalRegistro}
        />
      </div>

      {/* Modal interactivo para registrar nuevo usuario */}
      <UsuarioFormCard
        isOpen={isModalOpen}
        onClose={cerrarModalRegistro}
        onLimpiar={limpiarFormulario}
        nombreCompleto={nombreCompleto}
        onNombreCompletoChange={(val) => {
          setNombreCompleto(val);
          if (errores.nombreCompleto)
            setErrores((prev) => ({ ...prev, nombreCompleto: undefined }));
        }}
        correo={correo}
        onCorreoChange={(val) => {
          setCorreo(val);
          if (errores.correo) setErrores((prev) => ({ ...prev, correo: undefined }));
        }}
        rol={rol}
        onRolChange={setRol}
        errores={errores}
        isSubmitting={isSubmitting}
        onSubmit={(e) => void handleRegistrar(e)}
      />
    </div>
  );
}
