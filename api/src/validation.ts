/** Validação e normalização das entradas do formulário de solicitação. */

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const e = email.trim();
  if (e.length < 3 || e.length > 254) return false;
  // Regex pragmática (não RFC-completa): local@dominio.tld sem espaços.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function cleanName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const n = name.trim().replace(/\s+/g, ' ');
  if (n.length < 2 || n.length > 120) return null;
  return n;
}

export function isTruthyConsent(v: unknown): boolean {
  return v === 'on' || v === 'true' || v === true || v === '1' || v === 1;
}

export function cleanFileId(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  // slug seguro: letras, números, hífen e underscore
  if (!/^[a-z0-9][a-z0-9_-]{0,80}$/i.test(s)) return null;
  return s;
}

export function normalizeLocale(v: unknown): 'pt' | 'en' {
  return v === 'en' ? 'en' : 'pt';
}
