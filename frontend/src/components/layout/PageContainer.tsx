import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div
      className={`w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 2xl:px-8 py-5 sm:py-6 flex flex-col gap-5 ${className}`}
    >
      {children}
    </div>
  );
}
