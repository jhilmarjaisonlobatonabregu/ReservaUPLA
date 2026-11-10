import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

export interface ModalConfirmacionProps {
  isOpen: boolean;
  title: string;
  description: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'success' | 'danger';
  isLoading?: boolean;
  hideConfirmButton?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ModalConfirmacion({
  isOpen,
  title,
  description,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  isLoading = false,
  hideConfirmButton = false,
  onConfirm,
  onClose
}: ModalConfirmacionProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Captura inicial de foco (ISO 9241-171 Accesibilidad por teclado)
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusables && focusables.length > 0) {
      focusables[focusables.length - 1].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const badgeIcon = {
    primary: <Info className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
    danger: <AlertTriangle className="w-5 h-5 text-rose-700 dark:text-rose-400" />
  }[variant];

  const badgeBg = {
    primary: 'bg-blue-50 border-blue-200 dark:bg-blue-500/15 dark:border-blue-500/30',
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30',
    danger: 'bg-rose-50 border-rose-200 dark:bg-rose-500/15 dark:border-rose-500/30'
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacion-title"
      aria-describedby="modal-confirmacion-description"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${badgeBg}`}>
              {badgeIcon}
            </div>
            <div>
              <h3
                id="modal-confirmacion-title"
                className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]"
              >
                {title}
              </h3>
              <p
                id="modal-confirmacion-description"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                {description}
              </p>
            </div>
          </div>

          <Tooltip content="Cerrar ventana (Esc)" position="left">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Cerrar ventana modal"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        {children && (
          <div className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">{children}</div>
        )}

        <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            tooltip="Descartar y cerrar ventana (Esc)"
          >
            {cancelText}
          </Button>
          {!hideConfirmButton && (
            <Button
              variant={variant}
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText="Procesando..."
              tooltip="Confirmar y ejecutar acción en el sistema"
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
