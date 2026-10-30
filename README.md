# InvestSmart

React (Vite) + Node.js/Express + PostgreSQL, conforme o documento de modelação.

## Executar
1. `createdb investsmart && psql investsmart -f db/schema.sql`
2. `cd server && cp .env.example .env` (ajuste DATABASE_URL e JWT_SECRET) `&& npm install && npm run dev` (porta 4000)
3. `cd client && npm install && npm run dev` (porta 5173). Se a API estiver noutro endereço: `VITE_API=http://host:porta/api`.

O OCR (tesseract.js) descarrega os dados do idioma português na primeira utilização, por isso precisa de internet nesse momento.

## Notas de modelação
- `cotacao.valor` guarda o valor de mercado total da posição; o valor atual é a última cotação. Atualizar o valor de um investimento cria uma nova cotação, que alimenta a evolução patrimonial.
- Os tipos específicos (ação, imóvel, fundo) estão numa só tabela `investimento` com a coluna `tipo` e `detalhes JSONB`.
- Eliminar um investimento marca-o como `eliminado`; as transações ficam no histórico (RN12).
- Cada rota filtra por `id_utilizador` do token (RN05); documentos só criam registos após confirmação (RN06).
