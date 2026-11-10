import { useEffect, type FormEvent } from 'react';
import { Building2, MapPin, PlusCircle, RotateCcw, Users, X } from 'lucide-react';
import { Button, SelectInput, TextInput, Tooltip } from '../ui';
import type { ErroresFormularioAmbiente, EstadoAmbiente } from '../../types';
import { TIPOS_AMBIENTE_UPLA } from '../../utils/constants';

export interface AmbienteFormCardProps {
  isOpen: boolean;
  onClose: () => void;
  onLimpiar: () => void;
  nombre: string;
  onNombreChange: (val: string) => void;
  tipo: string;
  onTipoChange: (val: string) => void;
  capacidad: string;
  onCapacidadChange: (val: string) => void;
  ubicacion: string;
  onUbicacionChange: (val: string) => void;
  estado: EstadoAmbiente;
  onEstadoChange: (val: EstadoAmbiente) => void;
  errores: ErroresFormularioAmbiente;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function AmbienteFormCard({
  isOpen,
  onClose,
  onLimpiar,
  nombre,
  onNombreChange,
  tipo,
  onTipoChange,
  capacidad,
  onCapacidadChange,
  ubicacion,
  onUbicacionChange,
  estado,
  onEstadoChange,
  errores,
  isSubmitting,
  onSubmit
}: AmbienteFormCardProps) {
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

  const tieneBorradorEnCurso = nombre.trim().length > 0 || ubicacion.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ambiente-title"
      onClick={() => {
        if (!isSubmitting && !tieneBorradorEnCurso) onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50/80 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#1E3A8A] dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="modal-ambiente-title"
                className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]"
              >
                Registrar Ambiente Universitario
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nuevo espacio físico académico o administrativo de la UPLA
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
            id="ambiente-nombre"
            label="Nombre del Ambiente"
            placeholder="Ej. Laboratorio de Robótica L-205"
            required
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            error={errores.nombre}
            helperText="Identificador único del laboratorio, auditorio o aula"
            icon={<Building2 className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              id="ambiente-tipo"
              label="Tipo de Ambiente"
              required
              value={tipo}
              onChange={(e) => onTipoChange(e.target.value)}
              error={errores.tipo}
              options={TIPOS_AMBIENTE_UPLA}
            />

            {/* Shneiderman Regla 5 (Prevenir errores): Bloquear teclas no numéricas y valores <= 0 */}
            <TextInput
              id="ambiente-capacidad"
              type="number"
              inputMode="numeric"
              min={1}
              max={2000}
              step={1}
              label="Capacidad Máxima (Personas)"
              required
              value={capacidad}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const soloDigitos = e.target.value.replace(/\D/g, '');
                onCapacidadChange(soloDigitos);
              }}
              error={errores.capacidad}
              helperText="Número entero mayor a 0 (máx. 2000)"
              icon={<Users className="w-4 h-4" />}
            />
          </div>

          <TextInput
            id="ambiente-ubicacion"
            label="Ubicación Física"
            placeholder="Ej. Pabellón G - Piso 2 (Campus Chorrillos)"
            required
            value={ubicacion}
            onChange={(e) => onUbicacionChange(e.target.value)}
            error={errores.ubicacion}
            helperText="Pabellón, piso y sede del ambiente universitario"
            icon={<MapPin className="w-4 h-4" />}
          />

          <SelectInput
            id="ambiente-estado"
            label="Estado Operativo Inicial"
            required
            value={estado}
            onChange={(e) => onEstadoChange(e.target.value as EstadoAmbiente)}
            helperText="Solo los ambientes en estado Disponible admiten reservas nuevas"
            options={[
              { value: 'Disponible', label: 'Disponible' },
              { value: 'Mantenimiento', label: 'Mantenimiento' },
              { value: 'Inactivo', label: 'Inactivo' }
            ]}
          />

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
                icon={<PlusCircle className="w-4 h-4" />}
                tooltip="Registrar el nuevo ambiente universitario en el catálogo"
              >
                Guardar Ambiente
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
