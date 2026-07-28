import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { query } from '../db.js';
import { toCsv } from '../csv.js';

const COLUMNS = ['name', 'email', 'file_title', 'requested_at', 'downloaded_at'];

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Exportação protegida da lista de leads (item 3). Auth via Bearer ADMIN_TOKEN.
  app.get('/admin/leads.csv', async (request, reply) => {
    const auth = request.headers['authorization'];
    if (!config.adminToken || auth !== `Bearer ${config.adminToken}`) {
      return reply.code(401).send('Unauthorized');
    }
    const { rows } = await query<Record<string, unknown>>(
      `SELECT name, email, file_title, requested_at, downloaded_at
         FROM download_leads
        ORDER BY requested_at DESC`,
    );
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="leads.csv"');
    return reply.send(toCsv(rows, COLUMNS));
  });
}
