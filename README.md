# Sistema Gamificado do Programa 5S — SENAI Serra Catarinense

Estrutura inicial do sistema, baseada no documento `Levantamento de Requisitos —
Sistema Gamificado do Programa 5S` (06/08/2026).

## Stack

- **Backend:** Node.js + Express + Postgres (Supabase) — API REST, publicado
  como função serverless na Vercel
- **Frontend:** React + Vite — SPA, publicado como site estático na Vercel
- Sem autenticação real ainda (fase local/protótipo funcional): login por seleção
  de usuário cadastrado, para simular os 3 perfis (Coordenador, Líder, Influenciador).

## Como rodar localmente

1. Crie um projeto no [Supabase](https://supabase.com) e copie a connection
   string do banco (Project Settings → Database → Connection string → modo
   "Transaction pooler", porta 6543).
2. `cp backend/.env.example backend/.env` e preencha `DATABASE_URL`.

Abra dois terminais (ou use o terminal integrado do VS Code / Claude Code):

```bash
# Terminal 1 — backend (porta 3001)
cd backend
npm install
npm run db:migrate  # cria as tabelas no Supabase (idempotente)
npm run seed         # popula com dados de exemplo
npm run dev           # inicia a API com hot-reload

# Terminal 2 — frontend (porta 5173)
cd frontend
npm install
npm run dev
```

Depois é só acessar `http://localhost:5173`.

## Deploy (Supabase + Vercel)

- **Banco:** Supabase Postgres. Rode `npm run db:migrate` (com `DATABASE_URL`
  apontando pro Supabase) uma vez para criar as tabelas; `npm run seed` é
  opcional, popula dados de exemplo.
- **Backend:** projeto Vercel separado com Root Directory `backend/`. Variável
  de ambiente `DATABASE_URL` (Supabase, connection pooler). O Express roda
  como função serverless via `backend/api/index.js`.
- **Frontend:** projeto Vercel separado com Root Directory `frontend/`.
  Variável de ambiente `VITE_API_URL` apontando para a URL pública do projeto
  do backend (ex: `https://sistema-5s-backend.vercel.app`).

## Estrutura de pastas

```
sistema-5s/
├── backend/
│   ├── api/
│   │   └── index.js              # entrypoint serverless (Vercel)
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql        # estrutura das tabelas (Postgres)
│   │   │   ├── migrate.js        # aplica o schema no Supabase (rodar 1x)
│   │   │   ├── seed.js           # popula dados de exemplo (blocos, usuários, sensos)
│   │   │   ├── pontuacao.js      # aplica pontuação + histórico (transação)
│   │   │   └── index.js          # pool de conexão Postgres
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── usuarios.js
│   │   │   ├── blocos.js
│   │   │   ├── times.js
│   │   │   ├── chamados.js
│   │   │   ├── feitos.js
│   │   │   └── ranking.js
│   │   ├── app.js                # app Express (rotas + middlewares)
│   │   └── server.js             # entrypoint local (dev)
│   ├── vercel.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                # uma página por tela do fluxo
│   │   ├── components/
│   │   ├── styles/theme.css      # cores institucionais SENAI
│   │   ├── api.js                # cliente HTTP simples
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
└── CLAUDE.md                     # contexto do projeto para o Claude Code
```

## Status atual (v0)

O que já está funcional nesta primeira versão:

- Banco de dados com todas as tabelas do levantamento de requisitos (usuários,
  blocos, times, sensos parametrizáveis, chamados, feitos, histórico de pontos).
- Regra de pontuação inicial de 500 pontos por time.
- Regra de sensos não recuperáveis (Organização e Utilização) aplicada no backend.
- API REST básica para todos os módulos.
- Frontend com as telas principais navegáveis (ainda com estilo simples — o
  wireframe/visual definitivo vem depois, no Figma).

## O que falta (próximos passos)

Ver seção "Pontos em aberto" do levantamento de requisitos — várias regras (prazo
padrão de chamado, valor exato do bônus de iniciativa própria, critério de
desempate) estão implementadas com um valor padrão provisório e marcadas com
`// TODO` no código, para ajuste assim que o coordenador validar.
