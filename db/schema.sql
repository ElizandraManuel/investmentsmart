CREATE TABLE utilizador (
  id_utilizador SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  palavra_passe_hash TEXT NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT now()
);
CREATE TABLE investimento (
  id_investimento SERIAL PRIMARY KEY,
  id_utilizador INT NOT NULL REFERENCES utilizador ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('acao','imovel','fundo','outro')),
  nome VARCHAR(160) NOT NULL,
  valor_investido NUMERIC(16,2) NOT NULL CHECK (valor_investido >= 0),
  data_aquisicao DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ativo',
  detalhes JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE documento (
  id_documento SERIAL PRIMARY KEY,
  id_utilizador INT NOT NULL REFERENCES utilizador ON DELETE CASCADE,
  nome_ficheiro VARCHAR(255) NOT NULL,
  tipo_documento VARCHAR(80),
  texto_extraido TEXT,
  estado_processamento VARCHAR(20) NOT NULL DEFAULT 'pendente',
  data_importacao TIMESTAMP NOT NULL DEFAULT now()
);
CREATE TABLE transacao (
  id_transacao SERIAL PRIMARY KEY,
  id_utilizador INT NOT NULL REFERENCES utilizador ON DELETE CASCADE,
  id_investimento INT NOT NULL REFERENCES investimento,
  id_documento INT REFERENCES documento,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('aplicacao','compra','venda','resgate','rendimento')),
  data_transacao DATE NOT NULL,
  quantidade NUMERIC(18,6),
  valor_unitario NUMERIC(16,4),
  valor_total NUMERIC(16,2) NOT NULL
);
CREATE TABLE despesa (
  id_despesa SERIAL PRIMARY KEY,
  id_utilizador INT NOT NULL REFERENCES utilizador ON DELETE CASCADE,
  id_documento INT REFERENCES documento,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  data_despesa DATE NOT NULL,
  valor NUMERIC(16,2) NOT NULL CHECK (valor > 0)
);
CREATE TABLE relatorio (
  id_relatorio SERIAL PRIMARY KEY,
  id_utilizador INT NOT NULL REFERENCES utilizador ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL, periodo_fim DATE NOT NULL,
  tipo_periodo VARCHAR(10) NOT NULL,
  data_geracao TIMESTAMP NOT NULL DEFAULT now()
);
CREATE TABLE recomendacao (
  id_recomendacao SERIAL PRIMARY KEY,
  id_utilizador INT NOT NULL REFERENCES utilizador ON DELETE CASCADE,
  categoria VARCHAR(40) NOT NULL, descricao TEXT NOT NULL, fundamento TEXT NOT NULL,
  data_geracao TIMESTAMP NOT NULL DEFAULT now()
);
-- valor = valor de mercado total da posição nesse momento
CREATE TABLE cotacao (
  id_cotacao SERIAL PRIMARY KEY,
  id_investimento INT NOT NULL REFERENCES investimento ON DELETE CASCADE,
  data_hora TIMESTAMP NOT NULL DEFAULT now(),
  valor NUMERIC(16,2) NOT NULL,
  moeda CHAR(3) NOT NULL DEFAULT 'AOA'
);
CREATE INDEX ON investimento(id_utilizador);
CREATE INDEX ON transacao(id_utilizador, data_transacao);
CREATE INDEX ON despesa(id_utilizador, data_despesa);
CREATE INDEX ON cotacao(id_investimento, data_hora);
