import './style.css';
import DataTable from '../DataTable';
import type { Column } from '../DataTable';
import { api } from '../../services/api';
import { run } from '../../utils/run';
import { kz } from '../../utils/format';
import type { Expense } from '../../types';

interface Props { expenses: Expense[] | null; onChanged: () => void }

export default function ExpenseTable({ expenses, onChanged }: Props) {
  const eliminar = (d: Expense) =>
    run(async () => { await api(`/despesas/${d.id_despesa}`, { method: 'DELETE' }); onChanged(); });
  const columns: Column<Expense>[] = [
    { header: 'Data', render: d => d.data_despesa },
    { header: 'Descrição', render: d => d.descricao },
    { header: 'Categoria', render: d => d.categoria },
    { header: 'Valor', render: d => kz(d.valor) },
    { header: 'Ações', render: d => <button onClick={() => eliminar(d)}>Eliminar</button> },
  ];
  return <DataTable columns={columns} rows={expenses} getKey={d => d.id_despesa} empty="Ainda não registou gastos." />;
}
