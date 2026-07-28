/** Serializa linhas em CSV (RFC-4180: aspas duplicadas, campos com vírgula/aspas/quebra citados). */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown): string => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.join(',');
  const body = rows.map((r) => columns.map((c) => esc(r[c])).join(',')).join('\n');
  return rows.length ? `${head}\n${body}\n` : `${head}\n`;
}
