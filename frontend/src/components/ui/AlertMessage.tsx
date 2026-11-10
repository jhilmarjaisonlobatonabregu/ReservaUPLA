import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

export interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  details?: string[];
  onClose?: () => void;
  className?: string;
}

export function AlertMessage({
  type,
  title,
  message,
  details,
  onClose,
  className = ''
}: AlertMessageProps) {
  const styles = {
    success: {
      container:
        'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-2xs',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      Icon: CheckCircle2
    },
    error: {
      container:
        'bg-rose-50/90 dark:bg-rose-950/50 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200 shadow-2xs',
      iconColor: 'text-rose-700 dark:text-rose-400',
      Icon: AlertCircle
    },
    warning: {
      container:
        'bg-amber-50/90 dark:bg-amber-950/50 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-2xs',
      iconColor: 'text-amber-700 dark:text-amber-400',
      Icon: TriangleAlert
    },
    info: {
      container:
        'bg-blue-50/90 dark:bg-blue-950/50 border-blue-300 dark:border-blue-500/40 text-blue-950 dark:text-blue-200 shadow-2xs',
      iconColor: 'text-[#1E3A8A] dark:text-blue-400',
      Icon: Info
    }
  }[type];

  const { Icon } = styles;

  return (
    <div
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`rounded-xl border px-4 py-3 flex items-start justify-between gap-3 ${styles.container} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${styles.iconColor}`} aria-hidden="true" />
        <div className="text-sm">
          {title && <p className="font-bold mb-0.5">{title}</p>}
          <p className="font-medium leading-relaxed">{message}</p>
          {details && details.length > 0 && (
            <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-xs opacity-90">
              {details.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar alerta"
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
