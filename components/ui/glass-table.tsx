import { cn } from "@/lib/utils";
import React from "react";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface GlassTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  isLoading?: boolean;
}

export function GlassTable<T>({
  columns,
  data,
  className,
  isLoading,
}: GlassTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5 border-b border-white/10 text-xs uppercase text-gray-400 font-semibold tracking-wider sticky top-0 backdrop-blur-md">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={cn("px-6 py-4", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-400"
              >
                Loading data...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-400"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-white/5 transition-colors group"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      "px-6 py-4 text-sm text-gray-300 group-hover:text-white transition-colors",
                      col.className
                    )}
                  >
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
