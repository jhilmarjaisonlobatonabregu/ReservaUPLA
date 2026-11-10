import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => ReactNode;
}

export interface TableListProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  isLoading?: boolean;
}

export function TableList<T>({
  columns,
  data,
  rowKey,
  emptyTitle = 'No se encontraron registros',
  emptyDescription = 'Aún no hay elementos registrados o que coincidan con los criterios de búsqueda.',
  emptyAction,
  isLoading = false
}: TableListProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xs p-12 text-center">
        <div className="inline-block w-7 h-7 border-2 border-[#1E3A8A] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-[#F8FAFC]">
          Sincronizando registros institucionales...
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
          Actualizando información académica e institucional en tiempo real
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xs p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-3.5">
          <Inbox className="w-6 h-6" aria-hidden="true" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">{emptyTitle}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
          {emptyDescription}
        </p>
        {emptyAction && <div className="mt-4 flex justify-center">{emptyAction}</div>}
      </div>
    );
  }

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xs overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3.5 font-bold whitespace-nowrap ${alignClass[col.align ?? 'left']}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/80">
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                className="hover:bg-blue-50/35 dark:hover:bg-slate-800/75 transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-slate-800 dark:text-[#F8FAFC] align-middle ${alignClass[col.align ?? 'left']}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
