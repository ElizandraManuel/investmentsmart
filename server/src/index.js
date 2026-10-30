import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import pg from 'pg';

pg.types.setTypeParser(1700, Number); // NUMERIC -> number
pg.types.setTypeParser(1082, v => v); // DATE -> 'YYYY-MM-DD'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = (t, p) => pool.query(t, p).then(r => r.rows);
const app = express();
app.use(cors()); app.use(express.json());
const upload = multer({ dest: 'uploads/', limits: { fileSize: 8e6 } });
const bad = (m, status = 400) => Object.assign(new Error(m), { status });
const h = f => (req, res) => f(req, res).catch(e => {
  if (!e.status) console.error(e);
  res.status(e.status || 500).json({ erro: e.status ? e.message : 'Erro interno' });
});
const hoje = () => new Date().toISOString().slice(0, 10);
const sum = (a, k) => a.reduce((s, x) => s + x[k], 0);
const token = id => jwt.sign({ uid: id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ---------- Autenticação (F01, F02) ----------
app.post('/api/registo', h(async (req, res) => {
  const { nome, email, palavra_passe } = req.body;
  if (!nome || !email || !palavra_passe || palavra_passe.length < 8) throw bad('Dados inválidos (palavra-passe: mínimo 8 caracteres)');
  try {
    const [u] = await q('INSERT INTO utilizador(nome,email,palavra_passe_hash) VALUES($1,lower($2),$3) RETURNING id_utilizador,nome,email',
      [nome, email, await bcrypt.hash(palavra_passe, 10)]);
    res.json({ token: token(u.id_utilizador), utilizador: u });
  } catch (e) { if (e.code === '23505') throw bad('Este e-mail já está registado', 409); throw e; }
}));
app.post('/api/login', h(async (req, res) => {
  const [u] = await q('SELECT * FROM utilizador WHERE email=lower($1)', [req.body.email || '']);
  if (!u || !(await bcrypt.compare(req.body.palavra_passe || '', u.palavra_passe_hash))) throw bad('Credenciais inválidas', 401);
  res.json({ token: token(u.id_utilizador), utilizador: { id_utilizador: u.id_utilizador, nome: u.nome, email: u.email } });
}));

// RN05: tudo abaixo exige sessão e filtra sempre por req.uid
app.use('/api', (req, res, next) => {
  try { req.uid = jwt.verify((req.headers.authorization || '').slice(7), process.env.JWT_SECRET).uid; next(); }
  catch { res.status(401).json({ erro: 'Sessão inválida' }); }
});

app.get('/api/perfil', h(async (req, res) => res.json((await q('SELECT id_utilizador,nome,email,data_criacao FROM utilizador WHERE id_utilizador=$1', [req.uid]))[0])));
app.put('/api/perfil', h(async (req, res) => {
  const { nome, palavra_passe } = req.body;
  if (palavra_passe && palavra_passe.length < 8) throw bad('Palavra-passe demasiado curta');
  await q('UPDATE utilizador SET nome=COALESCE($2,nome), palavra_passe_hash=COALESCE($3,palavra_passe_hash) WHERE id_utilizador=$1',
    [req.uid, nome || null, palavra_passe ? await bcrypt.hash(palavra_passe, 10) : null]);
  res.json({ ok: true });
}));

// ---------- Investimentos (F04, F07) ----------
const INV = `SELECT i.*, COALESCE((SELECT valor FROM cotacao c WHERE c.id_investimento=i.id_investimento
  ORDER BY data_hora DESC, id_cotacao DESC LIMIT 1), i.valor_investido) AS valor_atual
  FROM investimento i WHERE i.id_utilizador=$1 AND i.estado<>'eliminado'`;

app.get('/api/investimentos', h(async (req, res) => res.json(await q(INV + ' ORDER BY i.data_aquisicao DESC', [req.uid]))));
app.post('/api/investimentos', h(async (req, res) => {
  const { tipo, nome, valor_investido, data_aquisicao, detalhes } = req.body;
  if (!['acao', 'imovel', 'fundo', 'outro'].includes(tipo) || !nome || !(Number(valor_investido) > 0)) throw bad('Dados inválidos');
  const d = data_aquisicao || hoje();
  const [i] = await q('INSERT INTO investimento(id_utilizador,tipo,nome,valor_investido,data_aquisicao,detalhes) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.uid, tipo, nome, valor_investido, d, detalhes || {}]);
  await q("INSERT INTO transacao(id_utilizador,id_investimento,tipo,data_transacao,valor_total) VALUES($1,$2,'aplicacao',$3,$4)", [req.uid, i.id_investimento, d, valor_investido]);
  await q('INSERT INTO cotacao(id_investimento,valor) VALUES($1,$2)', [i.id_investimento, valor_investido]);
  res.status(201).json(i);
}));
app.put('/api/investimentos/:id', h(async (req, res) => {
  const [i] = await q("UPDATE investimento SET nome=COALESCE($3,nome) WHERE id_investimento=$1 AND id_utilizador=$2 AND estado<>'eliminado' RETURNING *",
    [req.params.id, req.uid, req.body.nome || null]);
  if (!i) throw bad('Investimento não encontrado', 404);
  const va = req.body.valor_atual;
  if (va !== undefined && va !== '' && Number(va) >= 0) await q('INSERT INTO cotacao(id_investimento,valor) VALUES($1,$2)', [i.id_investimento, va]);
  res.json(i);
}));
app.delete('/api/investimentos/:id', h(async (req, res) => { // mantém histórico (RN12)
  await q("UPDATE investimento SET estado='eliminado' WHERE id_investimento=$1 AND id_utilizador=$2", [req.params.id, req.uid]);
  res.json({ ok: true });
}));

async function addTx(uid, b) {
  const [inv] = await q(INV + ' AND i.id_investimento=$2', [uid, b.id_investimento]);
  if (!inv) throw bad('Investimento não encontrado', 404);
  if (!['compra', 'rendimento'].includes(b.tipo)) throw bad('Tipo de transação inválido');
  const total = Number(b.valor_total) || Number(b.quantidade) * Number(b.valor_unitario);
  if (!(total > 0)) throw bad('Valor inválido');
  const [t] = await q('INSERT INTO transacao(id_utilizador,id_investimento,id_documento,tipo,data_transacao,quantidade,valor_unitario,valor_total) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [uid, inv.id_investimento, b.id_documento || null, b.tipo, b.data || hoje(), b.quantidade || null, b.valor_unitario || null, total]);
  if (b.tipo === 'compra') {
    await q('UPDATE investimento SET valor_investido=valor_investido+$1 WHERE id_investimento=$2', [total, inv.id_investimento]);
    await q('INSERT INTO cotacao(id_investimento,valor) VALUES($1,$2)', [inv.id_investimento, inv.valor_atual + total]);
  }
  return t;
}
app.post('/api/investimentos/:id/transacoes', h(async (req, res) =>
  res.status(201).json(await addTx(req.uid, { ...req.body, id_investimento: req.params.id }))));

// ---------- Despesas (F08) ----------
async function novaDespesa(uid, b) {
  if (!b.descricao || !b.categoria || !(Number(b.valor) > 0)) throw bad('Dados da despesa inválidos');
  return (await q('INSERT INTO despesa(id_utilizador,id_documento,descricao,categoria,data_despesa,valor) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [uid, b.id_documento || null, b.descricao, b.categoria, b.data || hoje(), b.valor]))[0];
}
app.get('/api/despesas', h(async (req, res) => res.json(await q('SELECT * FROM despesa WHERE id_utilizador=$1 ORDER BY data_despesa DESC, id_despesa DESC', [req.uid]))));
app.post('/api/despesas', h(async (req, res) => res.status(201).json(await novaDespesa(req.uid, req.body))));
app.delete('/api/despesas/:id', h(async (req, res) => {
  await q('DELETE FROM despesa WHERE id_despesa=$1 AND id_utilizador=$2', [req.params.id, req.uid]);
  res.json({ ok: true });
}));

// ---------- Documentos + OCR (F05, F06) ----------
const num = s => Number(s.replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
function sugerir(t) {
  const v = t.match(/total[^\d\n]{0,20}(\d[\d .]*[,.]\d{2})/i);
  const d = t.match(/(\d{2})[\/.-](\d{2})[\/.-](\d{4})/);
  return { valor: v ? num(v[1]) : null, data: d ? `${d[3]}-${d[2]}-${d[1]}` : null,
    descricao: (t.split('\n').find(l => l.trim().length > 3) || '').trim() };
}
app.get('/api/documentos', h(async (req, res) => res.json(await q('SELECT id_documento,nome_ficheiro,estado_processamento,data_importacao FROM documento WHERE id_utilizador=$1 ORDER BY id_documento DESC', [req.uid]))));
app.post('/api/documentos', upload.single('ficheiro'), h(async (req, res) => {
  if (!req.file) throw bad('Ficheiro em falta');
  let texto = '';
  try { ({ data: { text: texto } } = await Tesseract.recognize(req.file.path, 'por')); } catch (e) { console.error('OCR falhou', e.message); }
  const [doc] = await q('INSERT INTO documento(id_utilizador,nome_ficheiro,tipo_documento,texto_extraido,estado_processamento) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [req.uid, req.file.originalname, req.file.mimetype, texto, texto ? 'pendente' : 'falhou']);
  res.status(201).json({ documento: doc, sugestao: sugerir(texto) });
}));
app.post('/api/documentos/:id/confirmar', h(async (req, res) => { // RN06
  const [doc] = await q("SELECT * FROM documento WHERE id_documento=$1 AND id_utilizador=$2 AND estado_processamento='pendente'", [req.params.id, req.uid]);
  if (!doc) throw bad('Documento não encontrado ou já confirmado', 404);
  const b = { ...req.body, id_documento: doc.id_documento };
  const r = b.destino === 'despesa' ? await novaDespesa(req.uid, b) : await addTx(req.uid, b);
  await q("UPDATE documento SET estado_processamento='confirmado' WHERE id_documento=$1", [doc.id_documento]);
  res.json(r);
}));

// ---------- Histórico, evolução, relatórios, recomendações (F09–F12) ----------
app.get('/api/historico', h(async (req, res) => res.json(await q(
  `SELECT * FROM (
     SELECT 'investimento' AS origem, t.tipo, t.data_transacao AS data, i.nome AS descricao, t.valor_total AS valor
       FROM transacao t JOIN investimento i USING(id_investimento) WHERE t.id_utilizador=$1
     UNION ALL
     SELECT 'despesa', categoria, data_despesa, descricao, valor FROM despesa WHERE id_utilizador=$1
   ) x ORDER BY data DESC LIMIT 200`, [req.uid]))));

app.get('/api/evolucao', h(async (req, res) => res.json(await q(
  `SELECT dd.d::text AS data, SUM(c.valor) AS valor
   FROM (SELECT DISTINCT c.data_hora::date AS d FROM cotacao c JOIN investimento i USING(id_investimento)
         WHERE i.id_utilizador=$1 AND i.estado<>'eliminado') dd
   CROSS JOIN investimento i
   JOIN LATERAL (SELECT valor FROM cotacao WHERE id_investimento=i.id_investimento AND data_hora::date<=dd.d
                 ORDER BY data_hora DESC, id_cotacao DESC LIMIT 1) c ON true
   WHERE i.id_utilizador=$1 AND i.estado<>'eliminado' GROUP BY dd.d ORDER BY dd.d`, [req.uid]))));

async function relatorio(uid, tipo) { // RN07–RN09, RN11: capital, valor atual, rendimentos e gastos separados
  const [p] = await q("SELECT (CASE WHEN $1::text='mensal' THEN date_trunc('month',CURRENT_DATE)::date ELSE CURRENT_DATE-6 END) AS ini, CURRENT_DATE AS fim", [tipo]);
  const [t] = await q(`SELECT COALESCE(SUM(valor_total) FILTER (WHERE tipo IN ('compra','aplicacao')),0) AS investido,
      COALESCE(SUM(valor_total) FILTER (WHERE tipo='rendimento'),0) AS rendimentos
    FROM transacao WHERE id_utilizador=$1 AND data_transacao BETWEEN $2 AND $3`, [uid, p.ini, p.fim]);
  const categorias = await q('SELECT categoria, SUM(valor) AS total FROM despesa WHERE id_utilizador=$1 AND data_despesa BETWEEN $2 AND $3 GROUP BY categoria ORDER BY total DESC', [uid, p.ini, p.fim]);
  const inv = await q(INV, [uid]);
  const capital = sum(inv, 'valor_investido'), atual = sum(inv, 'valor_atual');
  await q(`INSERT INTO relatorio(id_utilizador,periodo_inicio,periodo_fim,tipo_periodo)
    SELECT $1::int,$2::date,$3::date,$4::text WHERE NOT EXISTS (SELECT 1 FROM relatorio WHERE id_utilizador=$1::int
      AND periodo_inicio=$2::date AND periodo_fim=$3::date AND tipo_periodo=$4::text)`, [uid, p.ini, p.fim, tipo]);
  return { tipo, inicio: p.ini, fim: p.fim, investidoPeriodo: t.investido, rendimentos: t.rendimentos,
    gastos: sum(categorias, 'total'), categorias, carteira: { capital, atual, ganhoNaoRealizado: atual - capital } };
}
app.get('/api/relatorios', h(async (req, res) => res.json(await relatorio(req.uid, req.query.tipo === 'mensal' ? 'mensal' : 'semanal'))));

app.get('/api/recomendacoes', h(async (req, res) => { // RN10: indicam sempre os dados em que se baseiam
  const inv = await q(INV, [req.uid]), out = [], total = sum(inv, 'valor_atual');
  if (!inv.length) out.push({ categoria: 'carteira', descricao: 'Ainda não tem investimentos registados. Adicione os seus ativos para acompanhar a carteira.', fundamento: 'Nenhum investimento registado.' });
  const porTipo = {};
  inv.forEach(i => porTipo[i.tipo] = (porTipo[i.tipo] || 0) + i.valor_atual);
  for (const [t, v] of Object.entries(porTipo)) if (total > 0 && v / total > 0.6)
    out.push({ categoria: 'concentração', descricao: `${Math.round(v / total * 100)}% da carteira está em "${t}". Avalie se esta concentração é adequada ao seu perfil.`, fundamento: `Valor em ${t}: ${v} de ${total} (limiar de alerta: 60%).` });
  const [d] = await q(`SELECT COALESCE(SUM(valor) FILTER (WHERE data_despesa > CURRENT_DATE-30),0) AS atual,
      COALESCE(SUM(valor) FILTER (WHERE data_despesa <= CURRENT_DATE-30 AND data_despesa > CURRENT_DATE-60),0) AS anterior
    FROM despesa WHERE id_utilizador=$1`, [req.uid]);
  if (d.anterior > 0 && d.atual > d.anterior * 1.2)
    out.push({ categoria: 'gastos', descricao: `Os gastos dos últimos 30 dias aumentaram ${Math.round((d.atual / d.anterior - 1) * 100)}% face aos 30 dias anteriores.`, fundamento: `Últimos 30 dias: ${d.atual}; 30 dias anteriores: ${d.anterior}.` });
  await q("DELETE FROM recomendacao WHERE id_utilizador=$1 AND data_geracao::date=CURRENT_DATE", [req.uid]);
  for (const r of out) await q('INSERT INTO recomendacao(id_utilizador,categoria,descricao,fundamento) VALUES($1,$2,$3,$4)', [req.uid, r.categoria, r.descricao, r.fundamento]);
  res.json(out);
}));

app.listen(process.env.PORT || 4000, () => console.log('InvestSmart API a correr'));
