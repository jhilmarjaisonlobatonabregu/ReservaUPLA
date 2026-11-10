import type { InputHTMLAttributes } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  error?: string | null;
  helperText?: string;
}

export function DateInput({
  label,
  id,
  error,
  helperText,
  required,
  className = '',
  ...props
}: DateInputProps) {
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-rose-600 dark:text-rose-400 ml-1 font-bold" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
          <Calendar className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="date"
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`w-full min-h-[42px] rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] bg-white dark:bg-[#0F172A] tabular-nums transition-all ${
            error
              ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 focus:border-rose-700 focus:ring-2 focus:ring-rose-600/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-[#1E3A8A] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E3A8A]/20 dark:focus:ring-[#3B82F6]/25'
          }`}
          {...props}
        />
      </div>

      <div className="min-h-[1.15rem] mt-1">
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs font-medium text-rose-700 dark:text-rose-400 flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${id}-helper`} className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
