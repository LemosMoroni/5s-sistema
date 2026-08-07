import { db, initSchema } from "./index.js";

initSchema();

console.log("Populando dados de exemplo...");

const insertBloco = db.prepare("INSERT OR IGNORE INTO blocos (nome) VALUES (?)");
const blocos = ["Bloco A", "Bloco B", "Bloco C/E", "Bloco D", "Correia Pinto", "Otacílio Costa"];
blocos.forEach((b) => insertBloco.run(b));

const getBlocoId = db.prepare("SELECT id FROM blocos WHERE nome = ?");

// Sensos e pontuação — Quadro 6 do manual
const insertSenso = db.prepare(
  "INSERT OR IGNORE INTO sensos (nome, pontos_nao_conformidade, recuperavel) VALUES (?, ?, ?)"
);
const sensos = [
  ["Organização", 10, 0],
  ["Utilização", 15, 0],
  ["Limpeza", 20, 1],
  ["Disciplina", 25, 1],
  ["Ato/Condição Insegura", 30, 1],
  ["Segurança e Saúde", 50, 1], // TODO: validar tratamento de acidentes com dias perdidos (50/100/150) com a coordenação
];
sensos.forEach((s) => insertSenso.run(...s));

// Um time por bloco, para começar
const insertTime = db.prepare(
  "INSERT INTO times (nome, bloco_id, pontuacao_atual) VALUES (?, ?, 500)"
);
const getTimeId = db.prepare("SELECT id FROM times WHERE bloco_id = ?");

blocos.forEach((nomeBloco) => {
  const blocoId = getBlocoId.get(nomeBloco).id;
  const jaExiste = getTimeId.get(blocoId);
  if (!jaExiste) {
    insertTime.run(`Equipe ${nomeBloco}`, blocoId);
  }
});

// Usuários de exemplo — 1 coordenador, 1 líder e 2 influenciadores no Bloco A
const insertUsuario = db.prepare(
  "INSERT INTO usuarios (nome, papel, bloco_id, time_id) VALUES (?, ?, ?, ?)"
);

const blocoAId = getBlocoId.get("Bloco A").id;
const timeAId = getTimeId.get(blocoAId).id;

const jaTemCoordenador = db.prepare("SELECT id FROM usuarios WHERE papel = 'coordenador'").get();
if (!jaTemCoordenador) {
  insertUsuario.run("Renato Jurevicz", "coordenador", null, null);
  insertUsuario.run("Filipe", "lider", blocoAId, timeAId);
  insertUsuario.run("Darci", "influenciador", blocoAId, timeAId);
  insertUsuario.run("Gabriel", "influenciador", blocoAId, timeAId);
}

console.log("Seed concluído. Banco em backend/data/5s.db");
