# InvestSmart

## Guia completo de instalação e utilização

O que instalar, o que fazer em cada pasta do projeto e como usar o sistema, passo a passo. Comandos pensados para Ubuntu (Linux).

Stack: React + TypeScript (Vite), Node.js com Express, PostgreSQL

---

## 1. Visão geral do projeto

O InvestSmart é um sistema web de gestão pessoal de investimentos. Tem **três partes** que têm de estar a correr ao mesmo tempo: a base de dados, o servidor e o cliente (a interface no navegador). Cada parte vive numa pasta.

```
investsmart/
  db/
    schema.sql          tabelas da base de dados
  server/               API (Node.js + Express)
    src/index.js        todas as rotas e regras do sistema
    package.json        dependências do servidor
    .env.example        modelo da configuração (copiar para .env)
  client/               interface (React + TypeScript)
    src/App/            raiz da aplicação
    src/pages/          uma pasta por página (dashboard, investments...)
    src/components/     uma pasta por componente (Sidebar, Stat...)
    src/hooks/ services/ types/ utils/
    package.json        dependências do cliente
  README.md
```

| Pasta | Para que serve | O que tem de fazer nela |
|---|---|---|
| db | Contém o ficheiro que cria as tabelas. | Executar o schema.sql uma única vez (secção 4). |
| server | A API que fala com a base de dados. | Criar o .env, instalar dependências e arrancar (secção 5). |
| client | A interface que abre no navegador. | Instalar dependências e arrancar (secção 6). |

## 2. O que precisa de instalar

| Programa | Versão | Para quê |
|---|---|---|
| PostgreSQL | Qualquer versão recente | Guardar utilizadores, investimentos e gastos. |
| Node.js e npm | Node 18 ou superior (recomendado 20) | Correr o servidor e o cliente. |
| Navegador | Firefox ou Chrome | Usar o sistema. |
| VS Code (opcional) | Qualquer | Editar ficheiros como o .env. |

### Instalar o PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

Confirme que o serviço está ativo e que arranca com o computador:

```bash
sudo systemctl enable --now postgresql
sudo systemctl status postgresql
```

Deve ver "active" a verde. Prima **q** para sair do estado.

### Instalar o Node.js

O Node que vem no repositório padrão do Ubuntu costuma ser antigo. Use o repositório oficial NodeSource (versão 20):

```bash
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Confirme as versões instaladas:

```bash
node -v
npm -v
psql --version
```

O `node -v` deve mostrar `v18` ou superior. Se já tem o Node por outro método (como nvm) e a versão é 18 ou mais, não precisa de reinstalar.

> **Windows ou Mac:** instale o PostgreSQL em postgresql.org/download (guarde a palavra-passe do utilizador postgres) e o Node.js LTS em nodejs.org. Os comandos npm são iguais. Para a base de dados, use `createdb -U postgres investsmart` e `psql -U postgres -d investsmart -f db/schema.sql` em vez de sudo -u postgres.

## 3. Abrir o terminal na pasta do projeto

Extraia o zip do projeto (por exemplo em Transferências ou Documentos). Fica uma pasta `investsmart`. Abra o Terminal e entre nela:

```bash
cd ~/Transferências/investsmart
ls
```

O comando `ls` deve listar `client db server README.md`. Se listar, está na pasta certa. Todos os passos seguintes partem daqui.

Vai usar **dois terminais** ao mesmo tempo, um para o servidor e outro para o cliente. Pode abrir um separador novo com **Ctrl+Shift+T**.

## 4. Pasta db: criar a base de dados

Faz-se uma única vez. No Ubuntu, o PostgreSQL só aceita o utilizador `postgres` através do utilizador de sistema com o mesmo nome. Por isso todos os comandos começam por `sudo -u postgres`. Pede a palavra-passe do seu utilizador do Ubuntu (a do sudo).

### Passo 4.1: criar a base de dados vazia

```bash
sudo -u postgres createdb investsmart
```

### Passo 4.2: criar as tabelas

```bash
sudo -u postgres psql -d investsmart < db/schema.sql
```

Deve ver várias linhas `CREATE TABLE` e `CREATE INDEX`. Use o formato com o sinal `<`, que evita problemas de permissão ao ler a sua pasta pessoal.

### Passo 4.3: definir uma palavra-passe para o postgres

O servidor liga-se à base de dados por rede (localhost) e precisa de palavra-passe. Escolha uma e substitua `minhasenha123`:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'minhasenha123';"
```

Deve aparecer `ALTER ROLE`. Guarde esta palavra-passe, vai usá-la no passo 5.

### Passo 4.4: confirmar

```bash
psql "postgres://postgres:minhasenha123@localhost:5432/investsmart" -c "\dt"
```

Deve listar as tabelas: utilizador, investimento, transacao, despesa, documento, relatorio, recomendacao e cotacao. Se listar, a pasta db está concluída.

## 5. Pasta server: configurar e arrancar a API

### Passo 5.1: entrar na pasta

```bash
cd server
```

### Passo 5.2: criar o ficheiro .env

O ficheiro `.env` guarda as suas configurações privadas. Ainda não existe: cria-se copiando o modelo. Como os nomes começam por ponto, ficam **escondidos**; use `ls -a` para os ver.

```bash
cp .env.example .env
ls -a
```

### Passo 5.3: editar o .env

```bash
nano .env
```

Use as setas para mexer no texto. Para guardar prima **Ctrl+O** e Enter, e para sair **Ctrl+X**. Em alternativa, `code .` abre a pasta no VS Code. O conteúdo final deve ser:

```
DATABASE_URL=postgres://postgres:minhasenha123@localhost:5432/investsmart
JWT_SECRET=cole-aqui-o-texto-gerado
PORT=4000
```

| Variável | O que colocar |
|---|---|
| DATABASE_URL | Troque minhasenha123 pela palavra-passe do passo 4.3. Se ela tiver caracteres especiais, codifique-os (@ passa a %40). |
| JWT_SECRET | Texto longo e aleatório que assina as sessões. Gere-o com o comando abaixo e cole o resultado. |
| PORT | Porta da API. Deixe 4000. |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 5.4: instalar e arrancar

```bash
npm install
npm run dev
```

O `npm install` só é preciso na primeira vez e demora um ou dois minutos. Depois deve aparecer **InvestSmart API a correr**. **Deixe este terminal aberto**: se o fechar, o servidor pára.

### Passo 5.5: confirmar que responde

Noutro terminal, escreva:

```bash
curl http://localhost:4000/api/perfil
```

A resposta `{"erro":"Sessão inválida"}` é a esperada: significa que o servidor está a correr e a pedir login. A pasta `uploads` é criada sozinha dentro de server na primeira vez que importar uma fatura.

## 6. Pasta client: instalar e arrancar a interface

Abra um **segundo terminal** (sem fechar o do servidor) e entre na pasta do cliente:

```bash
cd ~/Transferências/investsmart/client
npm install
npm run dev
```

O terminal mostra algo como `Local: http://localhost:5173/`. Deixe-o aberto.

### Organização do código do cliente

Cada componente e cada página tem a sua pasta, com o nome do componente, e dentro um `index.tsx` e um `style.css`. Por isso os imports não levam o nome do ficheiro.

```
src/pages/dashboard/index.tsx      painel principal
src/pages/investments/index.tsx    investimentos
src/pages/expenses/index.tsx       gastos
src/pages/documents/index.tsx      importar faturas
src/pages/reports/index.tsx        relatórios
src/pages/history/index.tsx        histórico
src/components/Stat/index.tsx      um componente por pasta
```

> **Verificar erros de TypeScript:** na pasta client, o comando `npm run build` verifica os tipos e gera a versão final. Se aparecer algum erro, envie-me a mensagem e eu corrijo.

### Se o servidor estiver noutra porta

Por defeito o cliente procura a API em `http://localhost:4000/api`. Se mudou a PORT no .env do servidor, crie na pasta client um ficheiro `.env` com esta linha (por exemplo, para a porta 5000) e reinicie o cliente:

```
VITE_API=http://localhost:5000/api
```

| Terminal | Pasta | Comando | Fica a correr em |
|---|---|---|---|
| 1 | investsmart/server | npm run dev | http://localhost:4000 |
| 2 | investsmart/client | npm run dev | http://localhost:5173 (abrir no navegador) |

## 7. Usar o sistema

Abra o navegador em **http://localhost:5173**. A partir daqui trabalha só na interface.

### Criar conta e entrar

Clique em **Criar uma conta**, preencha nome, e-mail e uma palavra-passe com pelo menos 8 caracteres e clique em **Criar conta**. Nas vezes seguintes use **Iniciar sessão**. Cada utilizador vê apenas os seus próprios dados. O menu à esquerda tem as páginas e, em baixo, o botão Terminar sessão.

### Conceitos importantes

| Termo | Significado |
|---|---|
| Capital investido | Dinheiro que aplicou na compra dos ativos. Não é lucro. |
| Valor atual | Quanto valem hoje os ativos, segundo o último valor que registou. |
| Ganho/perda não realizado | Valor atual menos capital investido. Só se torna real quando vende. |
| Rendimentos recebidos | Dividendos, rendas ou outros valores efetivamente recebidos. |
| Gastos | Despesas de consumo. Ficam à parte e nunca se misturam com o capital investido. |

### Cada página

| Página | O que faz e como usar |
|---|---|
| Painel | Mostra o valor atual da carteira, o ganho ou perda não realizado, os gastos e rendimentos do mês, o gráfico de evolução e as recomendações. Só consulta; não tem nada para preencher. |
| Investimentos | Preencha o formulário (tipo, nome, detalhe, valor investido em Kz, data) e clique em Adicionar investimento. Para atualizar o valor atual, escreva o novo valor total na coluna Atualizar valor e clique em Guardar. Eliminar remove da lista mas mantém o histórico. |
| Gastos | Indique descrição, categoria, data e valor e clique em Registar gasto. Pode eliminar gastos registados por engano. |
| Documentos | Escolha a fotografia de uma fatura. O sistema lê o texto (OCR) e sugere descrição, data e valor. Corrija o que for preciso, escolha registar como gasto ou transação e clique em Confirmar e registar. Só então o registo é criado. |
| Relatórios | Alterne entre Semanal (últimos 7 dias) e Mensal (do dia 1 até hoje). Vê capital, valor atual, ganho não realizado, o aplicado no período, rendimentos, gastos e gastos por categoria. |
| Histórico | Lista por data as operações de investimento e os gastos, incluindo os de investimentos eliminados. |

> **Atenção:** ao atualizar o valor de um investimento, escreva o valor **total** da posição, não o preço de uma unidade. Se tem 10 ações que valem 5.000 Kz cada, escreva 50.000. Na primeira importação de fatura o OCR descarrega dados do português, por isso precisa de internet e pode demorar alguns minutos.

### Exemplo de primeira utilização

1. Crie a conta.
2. Em Investimentos, adicione uma Ação "Ações Empresa A" com 100.000 Kz.
3. Atualize o valor atual para 115.000 Kz e guarde: o ganho não realizado passa a 15.000 Kz.
4. Em Gastos, registe "Táxi", Transporte, 3.500 Kz.
5. Veja o Painel e depois os Relatórios.
6. Importe uma fatura em Documentos, corrija e confirme.
7. Confira tudo no Histórico.

## 8. Usar no dia a dia

A instalação faz-se uma vez. Da próxima vez, basta garantir que o PostgreSQL está ativo e abrir dois terminais:

```bash
# garantir que o PostgreSQL está ativo
sudo systemctl start postgresql

# Terminal 1
cd ~/Transferências/investsmart/server
npm run dev

# Terminal 2
cd ~/Transferências/investsmart/client
npm run dev
```

Depois abra **http://localhost:5173**. Para parar, prima **Ctrl+C** em cada terminal. Os seus dados ficam guardados na base de dados.

## 9. Problemas frequentes

| Mensagem ou sintoma | Causa e solução |
|---|---|
| Peer authentication failed for user "postgres" | Usou -U postgres sem sudo. No Ubuntu use sudo -u postgres createdb ... (secção 4). |
| password authentication failed | A palavra-passe no DATABASE_URL do server/.env não é a do passo 4.3. Corrija e reinicie o servidor. |
| database "investsmart" does not exist | O passo 4.1 não foi feito. |
| relation "utilizador" does not exist | O schema.sql não foi executado (passo 4.2), ou foi noutra base de dados. |
| ECONNREFUSED 127.0.0.1:5432 | O PostgreSQL está parado. Corra sudo systemctl start postgresql. |
| EADDRINUSE | A porta já está ocupada. Feche o outro programa ou mude a PORT. |
| npm: command not found | O Node.js não está instalado (secção 2). |
| Erro de versão do Node ou do Vite | Node abaixo de 18. Atualize pela secção 2. |
| Failed to fetch ou erro ao entrar | O servidor (terminal 1) não está a correr, ou o VITE_API aponta para a porta errada. |
| Sessão inválida e volta ao login | A sessão expirou (7 dias) ou o JWT_SECRET mudou. Entre outra vez. |
| Alterei o .env e nada mudou | Pare com Ctrl+C e arranque outra vez com npm run dev. |
| OCR lento ou sem texto | Na primeira vez precisa de internet. Use uma imagem mais nítida. |

## 10. Resumo dos comandos

```bash
# Instalar (uma vez)
sudo apt update && sudo apt install -y postgresql postgresql-contrib curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Base de dados (uma vez, na pasta investsmart)
sudo -u postgres createdb investsmart
sudo -u postgres psql -d investsmart < db/schema.sql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'minhasenha123';"

# Servidor (terminal 1)
cd server && cp .env.example .env     # editar com: nano .env
npm install                           # só na primeira vez
npm run dev

# Cliente (terminal 2)
cd client && npm install              # só na primeira vez
npm run dev

# Usar
http://localhost:5173
```
