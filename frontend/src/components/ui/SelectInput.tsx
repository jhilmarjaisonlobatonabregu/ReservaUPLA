import type { SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string | null;
  helperText?: string;
}

export function SelectInput({
  label,
  id,
  options,
  placeholder,
  error,
  helperText,
  required,
  className = '',
  ...props
}: SelectInputProps) {
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

      <select
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={`w-full min-h-[42px] rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] bg-white dark:bg-[#0F172A] transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-600 ${
          error
            ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 focus:border-rose-700 focus:ring-2 focus:ring-rose-600/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-[#1E3A8A] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E3A8A]/20 dark:focus:ring-[#3B82F6]/25'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

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
