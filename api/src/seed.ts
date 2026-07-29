import { pool } from './db.js';
import { runMigrations } from './migrate.js';

/**
 * Registra arquivos de exemplo (idempotente). O binário correspondente deve existir em
 * STORAGE_DIR com o `filename` indicado. Ajuste/estenda conforme os arquivos reais.
 */
const FILES = [
  { id: 'artigo-exemplo-1', title: 'Artigo de exemplo 1', filename: 'artigo-exemplo-1.pdf' },
  { id: 'artigo-exemplo-2', title: 'Artigo de exemplo 2', filename: 'artigo-exemplo-2.pdf' },
  {
    id: 'abilene-falso-consenso',
    title: 'A armadilha do falso consenso e o fracasso na gestão de processos',
    filename: 'palestra_abilene_narrativa_clara.pdf',
  },
];

export async function seed(): Promise<void> {
  await runMigrations();
  for (const f of FILES) {
    await pool.query(
      `INSERT INTO files (id, title, filename, mime)
       VALUES ($1, $2, $3, 'application/pdf')
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, filename = EXCLUDED.filename`,
      [f.id, f.title, f.filename],
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log(`Seed concluído: ${FILES.length} arquivo(s) registrado(s).`);
      return pool.end();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
