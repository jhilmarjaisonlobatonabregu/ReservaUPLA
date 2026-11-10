import { useId, type ReactNode } from 'react';

export interface TooltipProps {
  content?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  className?: string;
}

export function Tooltip({
  content,
  position = 'top',
  children,
  className = 'inline-flex'
}: TooltipProps) {
  const tooltipId = useId();

  if (!content) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }[position];

  return (
    <span
      className={`relative group/tooltip ${className}`}
      aria-describedby={tooltipId}
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute z-50 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white border border-slate-700/80 text-[11px] font-semibold leading-snug tracking-normal shadow-lg whitespace-nowrap max-w-xs truncate opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100 transition-all duration-150 ${positionClasses}`}
      >
        {content}
      </span>
    </span>
  );
}
