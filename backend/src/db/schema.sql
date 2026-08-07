-- Schema do Sistema Gamificado do Programa 5S
-- Baseado no Levantamento de Requisitos (06/08/2026)

PRAGMA foreign_keys = ON;

-- Blocos/setores (Quadro 1 do manual)
CREATE TABLE IF NOT EXISTS blocos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

-- Times (um time pertence a um bloco; pontuação corrente vive aqui)
CREATE TABLE IF NOT EXISTS times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  bloco_id INTEGER NOT NULL REFERENCES blocos(id),
  pontuacao_atual INTEGER NOT NULL DEFAULT 500,
  ciclo_atual TEXT NOT NULL DEFAULT '2026-T3'  -- TODO: definir periodicidade oficial do ciclo com a coordenação
);

-- Usuários (Coordenador / Líder / Influenciador)
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('coordenador', 'lider', 'influenciador')),
  bloco_id INTEGER REFERENCES blocos(id),      -- NULL para coordenador
  time_id INTEGER REFERENCES times(id),         -- NULL para coordenador/líder sem time direto
  ativo INTEGER NOT NULL DEFAULT 1
);

-- Sensos e regras de pontuação (parametrizável — Quadro 6 do manual)
CREATE TABLE IF NOT EXISTS sensos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  pontos_nao_conformidade INTEGER NOT NULL,
  recuperavel INTEGER NOT NULL DEFAULT 1  -- 0 = não recuperável (Organização e Utilização)
);

-- Mural de chamados (aberto por Líder ou Coordenador; resolvido por qualquer time)
CREATE TABLE IF NOT EXISTS chamados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  senso_id INTEGER NOT NULL REFERENCES sensos(id),
  local TEXT,
  evidencia_url TEXT,
  criado_por INTEGER NOT NULL REFERENCES usuarios(id),
  bloco_origem_id INTEGER NOT NULL REFERENCES blocos(id),
  prazo_dias INTEGER NOT NULL DEFAULT 7,  -- TODO: validar prazo padrão com a coordenação
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'resolvido', 'vencido')),
  resolvido_por_time_id INTEGER REFERENCES times(id),
  resolvido_por_usuario_id INTEGER REFERENCES usuarios(id),
  evidencia_resolucao_url TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  resolvido_em TEXT
);

-- Feitos cadastrados por iniciativa própria (Influenciador -> aprovação do Coordenador)
CREATE TABLE IF NOT EXISTS feitos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  influenciador_id INTEGER NOT NULL REFERENCES usuarios(id),
  senso_id INTEGER NOT NULL REFERENCES sensos(id),
  descricao TEXT NOT NULL,
  local TEXT,
  evidencia_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
  justificativa_reprovacao TEXT,
  pontos_concedidos INTEGER,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  avaliado_em TEXT
);

-- Histórico de pontuação (toda alteração de placar gera uma entrada — auditoria/RNF03)
CREATE TABLE IF NOT EXISTS historico_pontos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_id INTEGER NOT NULL REFERENCES times(id),
  delta INTEGER NOT NULL,                 -- positivo = ganho, negativo = perda
  motivo TEXT NOT NULL,                   -- ex: "chamado #12 vencido", "feito #4 aprovado"
  origem_tipo TEXT NOT NULL CHECK (origem_tipo IN ('chamado', 'feito', 'ajuste_manual')),
  origem_id INTEGER,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
