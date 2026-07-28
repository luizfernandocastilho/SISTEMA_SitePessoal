import { config } from './config.js';
import { runMigrations } from './migrate.js';
import { buildServer } from './server.js';
import { closePool } from './db.js';

async function main(): Promise<void> {
  const applied = await runMigrations();
  if (applied.length) console.log(`Migrations aplicadas: ${applied.join(', ')}`);

  const app = await buildServer();
  await app.listen({ port: config.port, host: config.host });
}

main().catch(async (err) => {
  console.error(err);
  await closePool().catch(() => {});
  process.exit(1);
});
