import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  tooltip,
  tooltipPosition = 'top',
  disabled,
  type = 'button',
  className = '',
  title,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed select-none active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1';

  const sizeStyles = {
    sm: 'px-3 py-1.5 min-h-[34px] text-xs',
    md: 'px-4 py-2.5 min-h-[42px] text-sm',
    lg: 'px-5 py-3 min-h-[48px] text-sm tracking-wide'
  };

  const variantStyles = {
    primary:
      'bg-[#1E3A8A] dark:bg-[#3B82F6] text-white hover:bg-[#172554] dark:hover:bg-blue-600 shadow-xs border border-[#1E3A8A] dark:border-[#3B82F6]',
    secondary:
      'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-300/90 dark:border-slate-600',
    success:
      'bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 shadow-xs border border-emerald-700 dark:border-emerald-500',
    danger:
      'bg-rose-700 dark:bg-rose-600 text-white hover:bg-rose-800 dark:hover:bg-rose-500 shadow-xs border border-rose-700 dark:border-rose-500',
    outline:
      'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 shadow-2xs'
  };

  const effectiveTooltip = tooltip ?? title;
  const isFullWidth = className.includes('w-full');

  const buttonElement = (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-label={props['aria-label'] ?? (typeof children === 'string' ? undefined : effectiveTooltip)}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{loadingText ?? 'Procesando...'}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );

  if (!effectiveTooltip) {
    return buttonElement;
  }

  return (
    <Tooltip
      content={effectiveTooltip}
      position={tooltipPosition}
      className={isFullWidth ? 'flex w-full' : 'inline-flex'}
    >
      {buttonElement}
    </Tooltip>
  );
}
