import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api, kz } from './api';

const hoje = () => new Date().toISOString().slice(0, 10);
const useLoad = path => {
  const [d, setD] = useState(null);
  const load = useCallback(() => api(path).then(setD).catch(e => alert(e.message)), [path]);
  useEffect(() => { load(); }, [load]);
  return [d, load];
};
const run = async fn => { try { await fn(); } catch (e) { alert(e.message); } };
const useForm = init => {
  const [f, setF] = useState(init);
  return [f, k => e => setF({ ...f, [k]: e.target.value }), setF];
};
const Stat = ({ l, v, tone }) => <div className="stat"><span>{l}</span><b className={tone}>{v}</b></div>;
const tone = n => (n < 0 ? 'neg' : 'pos');

function Auth({ onLogin }) {
  const [reg, setReg] = useState(false);
  const [f, set] = useForm({});
  const go = e => { e.preventDefault(); run(async () => onLogin(await api(reg ? '/registo' : '/login', { method: 'POST', body: f }))); };
  return <div className="auth"><form onSubmit={go} className="card">
    <h1>InvestSmart</h1><p className="muted">Todos os seus investimentos e gastos num só lugar.</p>
    {reg && <input placeholder="Nome" onChange={set('nome')} required />}
    <input type="email" placeholder="E-mail" onChange={set('email')} required />
    <input type="password" placeholder="Palavra-passe (mínimo 8 caracteres)" minLength={8} onChange={set('palavra_passe')} required />
    <button className="pri">{reg ? 'Criar conta' : 'Iniciar sessão'}</button>
    <a onClick={() => setReg(!reg)}>{reg ? 'Já tenho conta' : 'Criar uma conta'}</a>
  </form></div>;
}

function Painel() {
  const [r] = useLoad('/relatorios?tipo=mensal'), [ev] = useLoad('/evolucao'), [rec] = useLoad('/recomendacoes');
  if (!r) return <p>A carregar…</p>;
  const c = r.carteira;
  return <>
    <div className="hero"><span>Valor atual da carteira</span><b>{kz(c.atual)}</b>
      <em className={tone(c.ganhoNaoRealizado)}>{c.ganhoNaoRealizado >= 0 ? '+' : ''}{kz(c.ganhoNaoRealizado)} não realizado, sobre {kz(c.capital)} investidos</em></div>
    <div className="grid"><Stat l="Gastos este mês" v={kz(r.gastos)} /><Stat l="Rendimentos recebidos no mês" v={kz(r.rendimentos)} /></div>
    <section className="card"><h3>Evolução patrimonial</h3>
      {ev?.length ? <ResponsiveContainer width="100%" height={240}><LineChart data={ev}>
        <XAxis dataKey="data" /><YAxis width={90} tickFormatter={v => v.toLocaleString('pt-AO')} /><Tooltip formatter={v => kz(v)} />
        <Line dataKey="valor" stroke="#0f6b5c" strokeWidth={2.5} dot={ev.length < 30} /></LineChart></ResponsiveContainer>
        : <p className="muted">Registe um investimento para começar a acompanhar a evolução.</p>}</section>
    <section className="card"><h3>Recomendações</h3>
      {rec?.length ? rec.map((x, i) => <div key={i} className="rec"><p>{x.descricao}</p><small>Baseado em: {x.fundamento}</small></div>) : <p className="muted">Sem alertas de momento.</p>}
      <small className="muted">Sugestões informativas baseadas nos seus registos. Não garantem rentabilidade.</small></section>
  </>;
}

const TIPOS = { acao: ['Ação', 'Símbolo'], imovel: ['Imóvel', 'Localização'], fundo: ['Fundo', 'Entidade gestora'], outro: ['Outro', 'Notas'] };
function Investimentos() {
  const [L, load] = useLoad('/investimentos');
  const init = { tipo: 'acao', data_aquisicao: hoje(), nome: '', valor_investido: '', info: '' };
  const [f, set, setF] = useForm(init);
  const [va, setVa] = useState({});
  const add = e => { e.preventDefault(); run(async () => { await api('/investimentos', { method: 'POST', body: { ...f, detalhes: { info: f.info } } }); setF(init); load(); }); };
  return <>
    <h2>Investimentos</h2>
    <form className="card row" onSubmit={add}>
      <select value={f.tipo} onChange={set('tipo')}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
      <input placeholder="Nome" value={f.nome} onChange={set('nome')} required />
      <input placeholder={TIPOS[f.tipo][1]} value={f.info} onChange={set('info')} />
      <input type="number" step="0.01" min="0.01" placeholder="Valor investido (Kz)" value={f.valor_investido} onChange={set('valor_investido')} required />
      <input type="date" value={f.data_aquisicao} onChange={set('data_aquisicao')} required />
      <button className="pri">Adicionar investimento</button>
    </form>
    <div className="scroll"><table><thead><tr><th>Nome</th><th>Tipo</th><th>Investido</th><th>Valor atual</th><th>Ganho/perda</th><th>Atualizar valor</th><th /></tr></thead>
      <tbody>{L?.map(i => <tr key={i.id_investimento}>
        <td>{i.nome}<small>{i.detalhes?.info}</small></td><td>{TIPOS[i.tipo][0]}</td><td>{kz(i.valor_investido)}</td><td>{kz(i.valor_atual)}</td>
        <td className={tone(i.valor_atual - i.valor_investido)}>{kz(i.valor_atual - i.valor_investido)}</td>
        <td className="inl"><input type="number" step="0.01" value={va[i.id_investimento] || ''} onChange={e => setVa({ ...va, [i.id_investimento]: e.target.value })} />
          <button onClick={() => run(async () => { await api('/investimentos/' + i.id_investimento, { method: 'PUT', body: { valor_atual: va[i.id_investimento] } }); setVa({ ...va, [i.id_investimento]: '' }); load(); })}>Guardar</button></td>
        <td><button onClick={() => confirm(`Eliminar "${i.nome}"? O histórico é mantido.`) && run(async () => { await api('/investimentos/' + i.id_investimento, { method: 'DELETE' }); load(); })}>Eliminar</button></td>
      </tr>)}</tbody></table>{L?.length === 0 && <p className="muted" style={{ padding: '0 .8rem' }}>Ainda não tem investimentos. Use o formulário acima.</p>}</div></>;
}

const CATS = ['Alimentação', 'Transporte', 'Habitação', 'Saúde', 'Comissões', 'Lazer', 'Outros'];
function Despesas() {
  const [L, load] = useLoad('/despesas');
  const init = { descricao: '', categoria: CATS[0], data: hoje(), valor: '' };
  const [f, set, setF] = useForm(init);
  return <>
    <h2>Gastos</h2>
    <form className="card row" onSubmit={e => { e.preventDefault(); run(async () => { await api('/despesas', { method: 'POST', body: f }); setF(init); load(); }); }}>
      <input placeholder="Descrição" value={f.descricao} onChange={set('descricao')} required />
      <select value={f.categoria} onChange={set('categoria')}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
      <input type="date" value={f.data} onChange={set('data')} required />
      <input type="number" step="0.01" min="0.01" placeholder="Valor (Kz)" value={f.valor} onChange={set('valor')} required />
      <button className="pri">Registar gasto</button>
    </form>
    <div className="scroll"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th /></tr></thead>
      <tbody>{L?.map(d => <tr key={d.id_despesa}><td>{d.data_despesa}</td><td>{d.descricao}</td><td>{d.categoria}</td><td>{kz(d.valor)}</td>
        <td><button onClick={() => run(async () => { await api('/despesas/' + d.id_despesa, { method: 'DELETE' }); load(); })}>Eliminar</button></td></tr>)}</tbody></table></div></>;
}

function Documentos() {
  const [docs, load] = useLoad('/documentos'), [inv] = useLoad('/investimentos');
  const [cur, setCur] = useState(null), [busy, setBusy] = useState(false);
  const [f, set, setF] = useForm({});
  const up = e => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('ficheiro', file); setBusy(true);
    run(async () => {
      const r = await api('/documentos', { method: 'POST', form: fd }); setCur(r.documento);
      setF({ destino: 'despesa', descricao: r.sugestao.descricao, data: r.sugestao.data || hoje(), valor: r.sugestao.valor || '', categoria: CATS[0], tipo: 'compra', id_investimento: inv?.[0]?.id_investimento });
      load();
    }).then(() => setBusy(false));
  };
  const ok = e => { e.preventDefault(); run(async () => { await api(`/documentos/${cur.id_documento}/confirmar`, { method: 'POST', body: { ...f, valor_total: f.valor } }); setCur(null); load(); }); };
  return <>
    <h2>Importar documento</h2>
    <div className="card"><p>Carregue uma fotografia de uma fatura. O texto é extraído por OCR e <b>só é registado depois de o confirmar</b>.</p>
      <input type="file" accept="image/*" onChange={up} />{busy && <p className="muted">A ler o documento…</p>}</div>
    {cur && <form className="card row" onSubmit={ok}>
      <select value={f.destino} onChange={set('destino')}><option value="despesa">Registar como gasto</option><option value="transacao">Registar como transação</option></select>
      {f.destino === 'despesa' ? <>
        <input value={f.descricao} onChange={set('descricao')} placeholder="Descrição" required />
        <select value={f.categoria} onChange={set('categoria')}>{CATS.map(c => <option key={c}>{c}</option>)}</select></> : <>
        <select value={f.id_investimento} onChange={set('id_investimento')}>{inv?.map(i => <option key={i.id_investimento} value={i.id_investimento}>{i.nome}</option>)}</select>
        <select value={f.tipo} onChange={set('tipo')}><option value="compra">Compra</option><option value="rendimento">Rendimento</option></select></>}
      <input type="date" value={f.data} onChange={set('data')} required />
      <input type="number" step="0.01" value={f.valor} onChange={set('valor')} placeholder="Valor (Kz)" required />
      <button className="pri">Confirmar e registar</button>
      <details><summary>Texto extraído</summary><pre>{cur.texto_extraido}</pre></details></form>}
    <div className="scroll"><table><thead><tr><th>Ficheiro</th><th>Estado</th><th>Data</th></tr></thead>
      <tbody>{docs?.map(d => <tr key={d.id_documento}><td>{d.nome_ficheiro}</td><td>{d.estado_processamento}</td><td>{d.data_importacao.slice(0, 10)}</td></tr>)}</tbody></table></div></>;
}

function Relatorios() {
  const [t, setT] = useState('semanal'), [r] = useLoad('/relatorios?tipo=' + t);
  return <>
    <h2>Relatórios</h2>
    <div className="tabs">{['semanal', 'mensal'].map(x => <button key={x} className={x === t ? 'on' : ''} onClick={() => setT(x)}>{x === 'semanal' ? 'Semanal' : 'Mensal'}</button>)}</div>
    {r && <><p className="muted">Período: {r.inicio} a {r.fim}</p>
      <div className="grid">
        <Stat l="Capital investido (carteira)" v={kz(r.carteira.capital)} /><Stat l="Valor atual da carteira" v={kz(r.carteira.atual)} />
        <Stat l="Ganho/perda não realizado" v={kz(r.carteira.ganhoNaoRealizado)} tone={tone(r.carteira.ganhoNaoRealizado)} />
        <Stat l="Aplicado no período" v={kz(r.investidoPeriodo)} /><Stat l="Rendimentos recebidos" v={kz(r.rendimentos)} /><Stat l="Gastos no período" v={kz(r.gastos)} /></div>
      <section className="card"><h3>Gastos por categoria</h3>{r.categorias.length ? r.categorias.map(c => <p key={c.categoria} className="line"><span>{c.categoria}</span><b>{kz(c.total)}</b></p>) : <p className="muted">Sem gastos neste período.</p>}</section>
      <small className="muted">Capital investido não é lucro. Valores antes de comissões e impostos.</small></>}</>;
}

function Historico() {
  const [L] = useLoad('/historico');
  return <><h2>Histórico</h2><div className="scroll"><table><thead><tr><th>Data</th><th>Origem</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr></thead>
    <tbody>{L?.map((x, i) => <tr key={i}><td>{x.data}</td><td>{x.origem}</td><td>{x.tipo}</td><td>{x.descricao}</td><td>{kz(x.valor)}</td></tr>)}</tbody></table></div></>;
}

const PAGES = [['Painel', Painel], ['Investimentos', Investimentos], ['Gastos', Despesas], ['Documentos', Documentos], ['Relatórios', Relatorios], ['Histórico', Historico]];
export default function App() {
  const [u, setU] = useState(() => JSON.parse(localStorage.getItem('u') || 'null'));
  const [tab, setTab] = useState(0);
  if (!u) return <Auth onLogin={r => { localStorage.setItem('t', r.token); localStorage.setItem('u', JSON.stringify(r.utilizador)); setU(r.utilizador); }} />;
  const Page = PAGES[tab][1];
  return <div className="app">
    <aside><h1>InvestSmart</h1>
      <nav>{PAGES.map(([n], i) => <button key={n} className={i === tab ? 'on' : ''} onClick={() => setTab(i)}>{n}</button>)}</nav>
      <div className="me">{u.nome}<button onClick={() => { localStorage.clear(); setU(null); }}>Terminar sessão</button></div></aside>
    <main><Page key={tab} /></main></div>;
}
