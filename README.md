# InvestSmart

React + TypeScript (Vite), Node.js + Express, PostgreSQL.

## Executar
1. Base de dados
   - Linux/Ubuntu: `sudo -u postgres createdb investsmart` e `sudo -u postgres psql -d investsmart < db/schema.sql`
     e depois `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'minhasenha';"`
   - Windows/Mac: `createdb -U postgres investsmart` e `psql -U postgres -d investsmart -f db/schema.sql`
2. Servidor: `cd server && cp .env.example .env` (editar DATABASE_URL e JWT_SECRET) `&& npm install && npm run dev` (porta 4000)
3. Cliente: `cd client && npm install && npm run dev` (porta 5173). API noutro endereço: `VITE_API=http://host:porta/api`.

## Estrutura do cliente (client/src)
```
App/                 index.tsx + style.css (raiz da aplicação)
pages/<nome>/        index.tsx + style.css   (auth, dashboard, investments, expenses, documents, reports, history)
components/<Nome>/   index.tsx + style.css   (um componente por pasta; importa-se sem nome de ficheiro)
hooks/               useLoad.ts, useForm.ts
services/api.ts      chamadas HTTP à API
types/index.ts       interfaces TypeScript
utils/               format.ts, run.ts, constants.ts
global.css           variáveis de cor, reset e classes base (.card, .row)
```
Exemplo de import: `import Stat from '../../components/Stat';`

## Notas de modelação
- `cotacao.valor` guarda o valor de mercado total da posição; o valor atual é a última cotação.
- Eliminar um investimento marca-o como `eliminado`; o histórico é mantido (RN12).
- Cada rota filtra por `id_utilizador` do token (RN05); documentos só criam registos após confirmação (RN06).
