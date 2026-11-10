import { useEffect, type FormEvent } from 'react';
import { Mail, RotateCcw, ShieldCheck, UserPlus, Users, X } from 'lucide-react';
import { Button, SelectInput, TextInput, Tooltip } from '../ui';
import type { ErroresFormularioUsuario, RolUsuario } from '../../types';

export interface UsuarioFormCardProps {
  isOpen: boolean;
  onClose: () => void;
  onLimpiar: () => void;
  nombreCompleto: string;
  onNombreCompletoChange: (val: string) => void;
  correo: string;
  onCorreoChange: (val: string) => void;
  rol: RolUsuario;
  onRolChange: (val: RolUsuario) => void;
  errores: ErroresFormularioUsuario;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function UsuarioFormCard({
  isOpen,
  onClose,
  onLimpiar,
  nombreCompleto,
  onNombreCompletoChange,
  correo,
  onCorreoChange,
  rol,
  onRolChange,
  errores,
  isSubmitting,
  onSubmit
}: UsuarioFormCardProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const tieneBorradorEnCurso = nombreCompleto.trim().length > 0 || correo.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-usuario-title"
      onClick={() => {
        if (!isSubmitting && !tieneBorradorEnCurso) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50/80 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#1E3A8A] dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="modal-usuario-title"
                className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]"
              >
                Registrar Usuario en el Padrón
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete los datos del actor institucional de la UPLA
              </p>
            </div>
          </div>

          <Tooltip content="Cerrar ventana (Esc)" position="left">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar ventana modal"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={onSubmit} noValidate className="p-6 space-y-4">
          <TextInput
            id="usuario-nombre"
            label="Nombre Completo"
            placeholder="Ej. Ing. Marco Antonio Quispe"
            required
            value={nombreCompleto}
            onChange={(e) => onNombreCompletoChange(e.target.value)}
            error={errores.nombreCompleto}
            helperText="Nombres y apellidos completos del docente, estudiante o administrativo"
            icon={<Users className="w-4 h-4" />}
          />

          <TextInput
            id="usuario-correo"
            type="email"
            label="Correo Electrónico Institucional"
            placeholder="Ej. mquispe@upla.edu.pe"
            required
            value={correo}
            onChange={(e) => onCorreoChange(e.target.value)}
            error={errores.correo}
            helperText="Correo institucional con el que iniciará sesión en ReservaUPLA"
            icon={<Mail className="w-4 h-4" />}
          />

          <SelectInput
            id="usuario-rol"
            label="Rol en el Sistema"
            required
            value={rol}
            onChange={(e) => onRolChange(e.target.value as RolUsuario)}
            helperText="En esta versión el usuario ingresa con la credencial institucional de su rol."
            options={[
              { value: 'Solicitante', label: 'Solicitante' },
              { value: 'Responsable de ambiente', label: 'Responsable de ambiente' },
              { value: 'Administrador', label: 'Administrador' }
            ]}
          />

          <div className="rounded-xl bg-blue-50/70 border border-blue-200/80 px-3.5 py-2.5 flex items-center gap-2 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <span>
              El usuario quedará habilitado de inmediato para iniciar sesión con su correo institucional.
            </span>
          </div>

          {/* Pie de acciones uniforme del Modal (Shneiderman Regla 1, 4 y 6: Cancelar a la izquierda, Primaria a la derecha) */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <Tooltip
              content="Restablecer los campos del formulario a sus valores por defecto"
              position="top"
            >
              <button
                type="button"
                onClick={onLimpiar}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar campos</span>
              </button>
            </Tooltip>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
                tooltip="Descartar cambios y cerrar esta ventana (Esc)"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                loadingText="Procesando..."
                icon={<UserPlus className="w-4 h-4" />}
                tooltip="Registrar el nuevo usuario en el padrón institucional"
              >
                Registrar Usuario
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
