# Contexto do projeto — Sistema Gamificado do Programa 5S (SENAI Serra Catarinense)

Este projeto implementa o sistema descrito no documento **"Levantamento de
Requisitos — Sistema Gamificado do Programa 5S"** (SENAI Serra Catarinense,
06/08/2026), construído em cima do **Manual do Programa 5S SERRA (v01)**.

## Resumo do domínio

O sistema gamifica a prática dos 5 sensos (Utilização, Organização, Limpeza,
Segurança e Saúde, Disciplina) entre os setores/blocos do SENAI. Cada time
começa um ciclo de avaliação com **500 pontos**. Pontos são perdidos por
não conformidades e podem (ou não) ser recuperados, dependendo do senso.

## Perfis (atores)

- **Coordenador** — acesso total. Cria/edita times e cargos. Cadastra líderes
  e os vincula a um bloco. Registra irregularidades no mural geral. Aprova ou
  reprova "feitos" de iniciativa própria. Acesso a todos os relatórios.
- **Líder** — responsável por um bloco/time. Cadastra os influenciadores da
  sua área. Cadastra chamados no mural geral.
- **Influenciador** — resolve chamados (do próprio bloco ou de outros).
  Cadastra feitos por iniciativa própria. Não gerencia pessoas.

## Regras de negócio principais (ver RN01–RN08 no levantamento de requisitos)

1. Toda equipe começa o ciclo com 500 pontos.
2. Pontuação por senso, por não conformidade (Quadro 6 do manual — parametrizada
   na tabela `sensos`, não hardcoded):
   - Organização: 10 pts — **não recuperável**
   - Utilização: 15 pts — **não recuperável**
   - Limpeza: 20 pts — recuperável
   - Disciplina: 25 pts — recuperável (exceto cunho pessoal)
   - Ato/Condição Insegura: 30 pts — recuperável
3. Um chamado aberto por um bloco pode ser resolvido por integrante de
   **qualquer outro bloco**, que recebe a pontuação.
4. Feitos por iniciativa própria (sem chamado prévio) dão **bônus** de pontos
   maior que resolver um chamado comum, mas dependem de aprovação do
   Coordenador.
5. Chamados vencidos (fora do prazo) geram perda efetiva de pontos para o
   bloco de origem.

## Pontos em aberto (implementados com valor provisório — marcados `// TODO`)

Estes itens dependem de validação do coordenador (ver seção 6 do levantamento
de requisitos) e por isso têm um valor padrão configurável, não fixo:

- Duração do ciclo de avaliação (provisório: trimestral).
- Prazo padrão de "tempo hábil" por chamado (provisório: 7 dias).
- Valor do bônus de iniciativa própria (provisório: pontos do senso × 1.5).
- Critério de desempate no ranking (provisório: menor nº de não conformidades).
- Tratamento da pontuação de acidente com dias perdidos (provisório: mesmo
  placar de 500 pontos, senso "Segurança e Saúde").

Ao ajustar qualquer um desses valores, atualizar também `backend/src/db/seed.js`
e este arquivo.

## Stack e convenções

- Backend: Express + better-sqlite3 (SQLite local, arquivo em `backend/data/5s.db`).
- Frontend: React + Vite, sem framework de UI pesado — CSS puro com variáveis
  de tema em `frontend/src/styles/theme.css` (cores institucionais SENAI:
  azul `#003087`, azul secundário `#1F5C99`, laranja `#F47920`).
- Sem TypeScript por enquanto (pode migrar depois se o projeto crescer).
- API REST simples, sem GraphQL.
- Autenticação real ainda não implementada — login atual é por seleção de
  usuário cadastrado (fase de protótipo funcional local).

## Como rodar

Ver `README.md` na raiz.
