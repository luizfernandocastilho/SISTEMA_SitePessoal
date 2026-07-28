import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Gera um token opaco (base64url, 256 bits). O valor bruto vai no link do e-mail. */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Hash do token para armazenar no banco (nunca guardamos o token bruto). */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Comparação em tempo constante de dois hashes hex de mesmo tamanho. */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
