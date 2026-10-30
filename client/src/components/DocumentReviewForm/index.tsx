import type { FormEvent } from 'react';
import './style.css';
import useForm from '../../hooks/useForm';
import { api } from '../../services/api';
import { run } from '../../utils/run';
import { today } from '../../utils/format';
import { CATEGORIAS } from '../../utils/constants';
import type { Investment, UploadResponse } from '../../types';

interface Props { upload: UploadResponse; investments: Investment[]; onConfirmed: () => void }

export default function DocumentReviewForm({ upload, investments, onConfirmed }: Props) {
  const { documento, sugestao } = upload;
  const { f, set } = useForm({
    destino: 'despesa', descricao: sugestao.descricao, categoria: CATEGORIAS[0], tipo: 'compra',
    id_investimento: String(investments[0]?.id_investimento ?? ''), data: sugestao.data || today(), valor: String(sugestao.valor ?? ''),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api(`/documentos/${documento.id_documento}/confirmar`, {
        method: 'POST', body: { ...f, id_investimento: Number(f.id_investimento), valor_total: f.valor },
      });
      onConfirmed();
    });
  };
  return (
    <form className="card row" onSubmit={submit}>
      <select value={f.destino} onChange={set('destino')}>
        <option value="despesa">Registar como gasto</option><option value="transacao">Registar como transação</option>
      </select>
      {f.destino === 'despesa' ? <>
        <input value={f.descricao} onChange={set('descricao')} placeholder="Descrição" required />
        <select value={f.categoria} onChange={set('categoria')}>{CATEGORIAS.map(c => <option key={c}>{c}</option>)}</select>
      </> : <>
        <select value={f.id_investimento} onChange={set('id_investimento')} required>
          {investments.map(i => <option key={i.id_investimento} value={i.id_investimento}>{i.nome}</option>)}
        </select>
        <select value={f.tipo} onChange={set('tipo')}><option value="compra">Compra</option><option value="rendimento">Rendimento</option></select>
      </>}
      <input type="date" value={f.data} onChange={set('data')} required />
      <input type="number" step="0.01" value={f.valor} onChange={set('valor')} placeholder="Valor (Kz)" required />
      <button className="pri">Confirmar e registar</button>
      <details className="ocr-text"><summary>Texto extraído</summary><pre>{documento.texto_extraido}</pre></details>
    </form>
  );
}
