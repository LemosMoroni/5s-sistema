import "dotenv/config";
import { pool, initSchema } from "./index.js";

await initSchema();

console.log("Populando dados de exemplo...");

const blocos = ["Bloco A", "Bloco B", "Bloco C/E", "Bloco D", "Correia Pinto", "Otacílio Costa"];
for (const nome of blocos) {
  await pool.query("INSERT INTO blocos (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING", [nome]);
}

async function getBlocoId(nome) {
  const { rows } = await pool.query("SELECT id FROM blocos WHERE nome = $1", [nome]);
  return rows[0].id;
}

// Sensos e pontuação — Quadro 6 do manual
const sensos = [
  ["Organização", 10, 0],
  ["Utilização", 15, 0],
  ["Limpeza", 20, 1],
  ["Disciplina", 25, 1],
  ["Ato/Condição Insegura", 30, 1],
  ["Segurança e Saúde", 50, 1], // TODO: validar tratamento de acidentes com dias perdidos (50/100/150) com a coordenação
];
for (const [nome, pontos, recuperavel] of sensos) {
  await pool.query(
    "INSERT INTO sensos (nome, pontos_nao_conformidade, recuperavel) VALUES ($1, $2, $3) ON CONFLICT (nome) DO NOTHING",
    [nome, pontos, recuperavel]
  );
}

// Um time por bloco, para começar
async function getTimeId(blocoId) {
  const { rows } = await pool.query("SELECT id FROM times WHERE bloco_id = $1", [blocoId]);
  return rows[0]?.id ?? null;
}

for (const nomeBloco of blocos) {
  const blocoId = await getBlocoId(nomeBloco);
  const jaExiste = await getTimeId(blocoId);
  if (!jaExiste) {
    await pool.query("INSERT INTO times (nome, bloco_id, pontuacao_atual) VALUES ($1, $2, 500)", [
      `Equipe ${nomeBloco}`,
      blocoId,
    ]);
  }
}

// Usuários de exemplo — 1 coordenador, 1 líder e 2 influenciadores no Bloco A
const blocoAId = await getBlocoId("Bloco A");
const timeAId = await getTimeId(blocoAId);

const { rows: coordenadores } = await pool.query("SELECT id FROM usuarios WHERE papel = 'coordenador'");
if (coordenadores.length === 0) {
  const insertUsuario = "INSERT INTO usuarios (nome, papel, bloco_id, time_id) VALUES ($1, $2, $3, $4)";
  await pool.query(insertUsuario, ["Renato Jurevicz", "coordenador", null, null]);
  await pool.query(insertUsuario, ["Filipe", "lider", blocoAId, timeAId]);
  await pool.query(insertUsuario, ["Darci", "influenciador", blocoAId, timeAId]);
  await pool.query(insertUsuario, ["Gabriel", "influenciador", blocoAId, timeAId]);
}

console.log("Seed concluído.");
await pool.end();
