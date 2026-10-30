import type { FormEvent } from 'react';
import './style.css';
import useForm from '../../hooks/useForm';
import { api } from '../../services/api';
import { run } from '../../utils/run';
import { today } from '../../utils/format';
import { CATEGORIAS } from '../../utils/constants';

const empty = () => ({ descricao: '', categoria: CATEGORIAS[0], data: today(), valor: '' });

export default function ExpenseForm({ onCreated }: { onCreated: () => void }) {
  const { f, set, setF } = useForm(empty());
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => { await api('/despesas', { method: 'POST', body: f }); setF(empty()); onCreated(); });
  };
  return (
    <form className="card row" onSubmit={submit}>
      <input placeholder="Descrição" value={f.descricao} onChange={set('descricao')} required />
      <select value={f.categoria} onChange={set('categoria')}>{CATEGORIAS.map(c => <option key={c}>{c}</option>)}</select>
      <input type="date" value={f.data} onChange={set('data')} required />
      <input type="number" step="0.01" min="0.01" placeholder="Valor (Kz)" value={f.valor} onChange={set('valor')} required />
      <button className="pri">Registar gasto</button>
    </form>
  );
}
