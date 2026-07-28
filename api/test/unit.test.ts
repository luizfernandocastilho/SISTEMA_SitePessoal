import { describe, it, expect } from 'vitest';
import { generateToken, hashToken, safeEqualHex } from '../src/tokens';
import {
  cleanFileId,
  cleanName,
  isTruthyConsent,
  isValidEmail,
  normalizeLocale,
} from '../src/validation';
import { toCsv } from '../src/csv';

describe('tokens', () => {
  it('gera tokens únicos url-safe', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('hash é estável e diferente do token bruto', () => {
    const t = generateToken();
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).not.toBe(t);
    expect(hashToken(t)).toHaveLength(64);
  });

  it('safeEqualHex compara corretamente', () => {
    const h = hashToken('abc');
    expect(safeEqualHex(h, h)).toBe(true);
    expect(safeEqualHex(h, hashToken('xyz'))).toBe(false);
    expect(safeEqualHex(h, 'short')).toBe(false);
  });
});

describe('validação', () => {
  it('e-mail', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('nome.sobrenome@dominio.com.br')).toBe(true);
    expect(isValidEmail('sem-arroba')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(42)).toBe(false);
  });

  it('nome', () => {
    expect(cleanName('  Luiz   Castilho ')).toBe('Luiz Castilho');
    expect(cleanName('a')).toBeNull();
    expect(cleanName(123)).toBeNull();
  });

  it('consentimento', () => {
    expect(isTruthyConsent('on')).toBe(true);
    expect(isTruthyConsent('true')).toBe(true);
    expect(isTruthyConsent(true)).toBe(true);
    expect(isTruthyConsent('no')).toBe(false);
    expect(isTruthyConsent(undefined)).toBe(false);
  });

  it('fileId (slug seguro)', () => {
    expect(cleanFileId('artigo-exemplo-1')).toBe('artigo-exemplo-1');
    expect(cleanFileId('../etc/passwd')).toBeNull();
    expect(cleanFileId('com espaço')).toBeNull();
  });

  it('locale', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('pt')).toBe('pt');
    expect(normalizeLocale('xx')).toBe('pt');
  });
});

describe('csv', () => {
  it('escapa campos com vírgula/aspas/quebra', () => {
    const csv = toCsv([{ a: 'x,y', b: 'ele disse "oi"', c: 'linha\nnova' }], ['a', 'b', 'c']);
    expect(csv).toBe('a,b,c\n"x,y","ele disse ""oi""","linha\nnova"\n');
  });

  it('só cabeçalho quando não há linhas', () => {
    expect(toCsv([], ['a', 'b'])).toBe('a,b\n');
  });
});
