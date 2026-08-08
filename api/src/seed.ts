import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pool } from './db.js';
import { runMigrations } from './migrate.js';

/**
 * Registro de arquivos gated DERIVADO do conteúdo do site (fonte única da verdade).
 *
 * Convenção (épico #185): um item de conteúdo com `fileId` é gated; o binário
 * correspondente chama-se `<fileId>.pdf` em STORAGE_DIR. O título vem do próprio
 * conteúdo (`title_pt` || `title`). Não há mais lista hardcoded aqui — para adicionar
 * um arquivo, basta criar o JSON com `fileId` e colocar `<fileId>.pdf` no storage.
 */

// Coleções do site que podem ter arquivos gated.
const COLLECTIONS = ['articles', 'keynotes', 'livros', 'relatorios'];

// Conteúdo do site: no container é o mount read-only; em dev, ../src/content (cwd = api/).
const CONTENT_DIR = process.env.CONTENT_DIR || resolve(process.cwd(), '../src/content');
const STORAGE_DIR = process.env.STORAGE_DIR || resolve(process.cwd(), 'storage');

interface FileEntry {
  id: string;
  title: string;
  filename: string;
}

/** Varre as coleções de conteúdo e devolve um registro por item com `fileId`. */
export function collectFiles(): FileEntry[] {
  const byId = new Map<string, FileEntry>();
  for (const col of COLLECTIONS) {
    const dir = join(CONTENT_DIR, col);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.json')) continue;
      const item = JSON.parse(readFileSync(join(dir, name), 'utf8')) as Record<string, unknown>;
      const fileId = typeof item.fileId === 'string' ? item.fileId : null;
      if (!fileId) continue;
      const title =
        (typeof item.title_pt === 'string' && item.title_pt) ||
        (typeof item.title === 'string' && item.title) ||
        fileId;
      byId.set(fileId, { id: fileId, title, filename: `${fileId}.pdf` });
    }
  }
  return [...byId.values()];
}

export async function seed(): Promise<FileEntry[]> {
  await runMigrations();
  const files = collectFiles();
  for (const f of files) {
    await pool.query(
      `INSERT INTO files (id, title, filename, mime)
       VALUES ($1, $2, $3, 'application/pdf')
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, filename = EXCLUDED.filename`,
      [f.id, f.title, f.filename],
    );
  }
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then((files) => {
      console.log(`Seed concluído: ${files.length} arquivo(s) registrado(s) a partir do conteúdo.`);
      // Fecha a lacuna de consistência: avisa se algum <fileId>.pdf não existir no storage.
      const missing = files.filter((f) => !existsSync(join(STORAGE_DIR, f.filename)));
      if (missing.length) {
        console.warn(
          `\n⚠ ${missing.length} arquivo(s) SEM binário em ${STORAGE_DIR}:\n` +
            missing.map((f) => `  - ${f.filename}  (fileId: ${f.id})`).join('\n') +
            `\nColoque o(s) PDF(s) com esse nome no diretório para o download funcionar.`,
        );
      }
      return pool.end();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
