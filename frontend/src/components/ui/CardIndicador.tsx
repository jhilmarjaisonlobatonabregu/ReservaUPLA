import type { KeyboardEvent, ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export interface CardIndicadorProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  icon: ReactNode;
  tone?: 'blue' | 'amber' | 'emerald' | 'red' | 'indigo';
  tooltip?: string;
  onClick?: () => void;
}

export function CardIndicador({
  title,
  value,
  subtitle,
  badgeText,
  icon,
  tone = 'blue',
  tooltip,
  onClick
}: CardIndicadorProps) {
  const toneStyles = {
    blue: {
      topBar: 'bg-[#1E3A8A] dark:bg-[#3B82F6]',
      iconBox:
        'bg-blue-50 text-[#1E3A8A] border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
      badge:
        'bg-blue-50 text-[#1E3A8A] border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
      hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-500/60'
    },
    amber: {
      topBar: 'bg-amber-500',
      iconBox:
        'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
      badge:
        'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
      hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-500/60'
    },
    emerald: {
      topBar: 'bg-emerald-600 dark:bg-emerald-500',
      iconBox:
        'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
      badge:
        'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-500/60'
    },
    red: {
      topBar: 'bg-rose-600 dark:bg-rose-500',
      iconBox:
        'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
      badge:
        'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
      hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-500/60'
    },
    indigo: {
      topBar: 'bg-indigo-700 dark:bg-indigo-500',
      iconBox:
        'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
      badge:
        'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
      hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-500/60'
    }
  }[tone];

  const isNumeric = typeof value === 'number';

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const cardElement = (
    <article
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${title}: ${value}. ${subtitle ?? ''}`}
      className={`w-full relative bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col justify-between p-5 transition-all duration-150 ${
        toneStyles.hoverBorder
      } ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#3B82F6]' : ''}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${toneStyles.topBar}`} aria-hidden="true" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${toneStyles.iconBox}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p
            className={`font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-[#F8FAFC] ${
              isNumeric
                ? 'text-3xl sm:text-[32px] leading-none'
                : 'text-base sm:text-lg leading-snug line-clamp-2'
            }`}
          >
            {value}
          </p>
          {badgeText && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${toneStyles.badge}`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );

  const effectiveTooltip =
    tooltip ?? (onClick ? `Consultar detalle de ${title.toLowerCase()} en el módulo de reservas` : undefined);

  if (!effectiveTooltip) {
    return cardElement;
  }

  return (
    <Tooltip content={effectiveTooltip} position="top" className="flex w-full h-full">
      {cardElement}
    </Tooltip>
  );
}
