import type { ReactNode } from 'react';
import './style.css';

export interface Column<T> { header: string; render: (row: T) => ReactNode }
interface Props<T> { columns: Column<T>[]; rows: T[] | null; getKey: (row: T) => string | number; empty?: string }

/** Tabela genérica reutilizada por todas as listagens. */
export default function DataTable<T>({ columns, rows, getKey, empty }: Props<T>) {
  return (
    <div className="data-table">
      <table>
        <thead><tr>{columns.map(c => <th key={c.header}>{c.header}</th>)}</tr></thead>
        <tbody>
          {rows?.map(r => <tr key={getKey(r)}>{columns.map(c => <td key={c.header}>{c.render(r)}</td>)}</tr>)}
        </tbody>
      </table>
      {rows?.length === 0 && empty && <p className="muted data-table-empty">{empty}</p>}
    </div>
  );
}
