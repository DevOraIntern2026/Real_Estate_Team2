import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** shown under the table header when `rows` is empty */
  empty?: ReactNode;
  /** hide the header visually (still readable by screen readers) */
  showHeader?: boolean;
  /** makes every row clickable */
  onRowClick?: (row: T) => void;
};

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
  showHeader = true,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-start text-sm text-[#241A12]">
          <thead className={showHeader ? undefined : "sr-only"}>
            <tr className="border-b-[0.8px] border-[#87400E]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-2 py-3 text-start font-medium ${c.className ?? ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b-[0.8px] border-[#87400E]/40 ${
                  onRowClick ? "cursor-pointer hover:bg-[#F3E9E0]/50" : ""
                }`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-2 py-5 ${c.className ?? ""}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && empty}
    </>
  );
}
