import type { FormEvent } from 'react';
import './style.css';
import useForm from '../../hooks/useForm';
import { api } from '../../services/api';
import { run } from '../../utils/run';
import { today } from '../../utils/format';
import { TIPOS } from '../../utils/constants';
import type { InvestmentType } from '../../types';

const empty = () => ({ tipo: 'acao', nome: '', info: '', valor_investido: '', data_aquisicao: today() });

export default function InvestmentForm({ onCreated }: { onCreated: () => void }) {
  const { f, set, setF } = useForm(empty());
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api('/investimentos', { method: 'POST', body: { ...f, detalhes: { info: f.info } } });
      setF(empty()); onCreated();
    });
  };
  return (
    <form className="card row" onSubmit={submit}>
      <select value={f.tipo} onChange={set('tipo')}>
        {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
      </select>
      <input placeholder="Nome" value={f.nome} onChange={set('nome')} required />
      <input placeholder={TIPOS[f.tipo as InvestmentType][1]} value={f.info} onChange={set('info')} />
      <input type="number" step="0.01" min="0.01" placeholder="Valor investido (Kz)" value={f.valor_investido} onChange={set('valor_investido')} required />
      <input type="date" value={f.data_aquisicao} onChange={set('data_aquisicao')} required />
      <button className="pri">Adicionar investimento</button>
    </form>
  );
}
