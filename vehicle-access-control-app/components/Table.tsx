
import React, { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode); // Can be a key or a render function
  className?: string; // For th/td styling
  headerClassName?: string; // For th specific styling
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  renderRowActions?: (item: T) => ReactNode; // Optional actions column
  onRowClick?: (item: T) => void; // Optional row click handler
  emptyStateMessage?: string;
}

const Table = <T extends { id: string | number }>(
  { columns, data, isLoading, error, renderRowActions, onRowClick, emptyStateMessage = "Nenhum dado encontrado." }: TableProps<T>
): React.ReactNode => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-100 border border-red-300 rounded-md">Erro: {error}</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 p-10 border rounded-md bg-white">{emptyStateMessage}</div>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
            {renderRowActions && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr 
              key={item.id} 
              className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((col, index) => (
                <td key={index} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${col.className || ''}`}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : String(item[col.accessor] === null || typeof item[col.accessor] === 'undefined' ? '' : item[col.accessor])}
                </td>
              ))}
              {renderRowActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {renderRowActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

