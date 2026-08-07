# Sistema Gamificado do Programa 5S — SENAI Serra Catarinense

Estrutura inicial do sistema, baseada no documento `Levantamento de Requisitos —
Sistema Gamificado do Programa 5S` (06/08/2026).

## Stack

- **Backend:** Node.js + Express + SQLite (better-sqlite3) — API REST
- **Frontend:** React + Vite — SPA
- Sem autenticação real ainda (fase local/protótipo funcional): login por seleção
  de usuário cadastrado, para simular os 3 perfis (Coordenador, Líder, Influenciador).

## Como rodar localmente

Abra dois terminais (ou use o terminal integrado do VS Code / Claude Code):

```bash
# Terminal 1 — backend (porta 3001)
cd backend
npm install
npm run seed     # cria o banco SQLite e popula com dados de exemplo
npm run dev       # inicia a API com hot-reload

# Terminal 2 — frontend (porta 5173)
cd frontend
npm install
npm run dev
```

Depois é só acessar `http://localhost:5173`.

## Estrutura de pastas

```
sistema-5s/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql        # estrutura das tabelas
│   │   │   ├── seed.js           # popula dados de exemplo (blocos, usuários, sensos)
│   │   │   └── index.js          # conexão com o SQLite
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── usuarios.js
│   │   │   ├── blocos.js
│   │   │   ├── times.js
│   │   │   ├── chamados.js
│   │   │   ├── feitos.js
│   │   │   └── ranking.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                # uma página por tela do fluxo
│   │   ├── components/
│   │   ├── styles/theme.css      # cores institucionais SENAI
│   │   ├── api.js                # cliente HTTP simples
│   │   ├── App.jsx
│   │   └── main.jsx
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
