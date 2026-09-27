import type { ReactNode } from "react";

export interface AdminColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export default function AdminDataTable<T>({ rows, columns, rowKey, emptyMessage = "Không có dữ liệu." }: { rows: T[]; columns: AdminColumn<T>[]; rowKey: (row: T) => string | number; emptyMessage?: string }) {
  return (
    <div className="overflow-x-auto border border-[#dce3e5] bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#f1f5f5] text-xs font-bold uppercase text-[#52636c]"><tr>{columns.map((column) => <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3">{column.header}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#e7ebec]">
          {rows.map((row) => <tr key={rowKey(row)} className="hover:bg-[#fafcfc]">{columns.map((column) => <td key={column.key} className="px-4 py-3 align-top">{column.render(row)}</td>)}</tr>)}
          {rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-[#657780]">{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
