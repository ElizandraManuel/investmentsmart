import './style.css';
import DataTable from '../DataTable';
import type { Column } from '../DataTable';
import { kz } from '../../utils/format';
import type { HistoryItem } from '../../types';

const columns: Column<HistoryItem>[] = [
  { header: 'Data', render: x => x.data },
  { header: 'Origem', render: x => x.origem },
  { header: 'Tipo', render: x => x.tipo },
  { header: 'Descrição', render: x => x.descricao },
  { header: 'Valor', render: x => kz(x.valor) },
];

export default function HistoryTable({ items }: { items: HistoryItem[] | null }) {
  return <DataTable columns={columns} rows={items} getKey={x => `${x.origem}-${x.data}-${x.descricao}-${x.valor}-${x.tipo}`} empty="Sem movimentos registados." />;
}
