import Fastify, { type FastifyInstance } from 'fastify';
import formbody from '@fastify/formbody';
import rateLimit from '@fastify/rate-limit';
import { downloadRoutes } from './routes/downloads.js';
import { adminRoutes } from './routes/admin.js';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true, trustProxy: true, bodyLimit: 64 * 1024 });

  await app.register(formbody); // aceita application/x-www-form-urlencoded (POST nativo do form)
  await app.register(rateLimit, { max: 20, timeWindow: '10 minutes' });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(downloadRoutes);
  await app.register(adminRoutes);

  return app;
}
