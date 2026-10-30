import { useState } from 'react';
import './style.css';
import DataTable from '../DataTable';
import type { Column } from '../DataTable';
import { api } from '../../services/api';
import { run } from '../../utils/run';
import { kz, tone } from '../../utils/format';
import { TIPOS } from '../../utils/constants';
import type { Investment } from '../../types';

interface Props { investments: Investment[] | null; onChanged: () => void }

export default function InvestmentTable({ investments, onChanged }: Props) {
  const [novo, setNovo] = useState<Record<number, string>>({});

  const guardar = (i: Investment) => run(async () => {
    await api(`/investimentos/${i.id_investimento}`, { method: 'PUT', body: { valor_atual: novo[i.id_investimento] } });
    setNovo({ ...novo, [i.id_investimento]: '' }); onChanged();
  });
  const eliminar = (i: Investment) => {
    if (!confirm(`Eliminar "${i.nome}"? O histórico é mantido.`)) return;
    run(async () => { await api(`/investimentos/${i.id_investimento}`, { method: 'DELETE' }); onChanged(); });
  };

  const columns: Column<Investment>[] = [
    { header: 'Nome', render: i => <>{i.nome}<small>{i.detalhes?.info}</small></> },
    { header: 'Tipo', render: i => TIPOS[i.tipo][0] },
    { header: 'Investido', render: i => kz(i.valor_investido) },
    { header: 'Valor atual', render: i => kz(i.valor_atual) },
    { header: 'Ganho/perda', render: i => <span className={tone(i.valor_atual - i.valor_investido)}>{kz(i.valor_atual - i.valor_investido)}</span> },
    { header: 'Atualizar valor', render: i => (
      <div className="update-value">
        <input type="number" step="0.01" value={novo[i.id_investimento] || ''}
          onChange={e => setNovo({ ...novo, [i.id_investimento]: e.target.value })} />
        <button onClick={() => guardar(i)}>Guardar</button>
      </div>) },
    { header: 'Ações', render: i => <button onClick={() => eliminar(i)}>Eliminar</button> },
  ];
  return <DataTable columns={columns} rows={investments} getKey={i => i.id_investimento} empty="Ainda não tem investimentos. Use o formulário acima." />;
}
