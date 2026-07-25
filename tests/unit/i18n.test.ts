import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  getLocaleFromPath,
  otherLocale,
  switchLocalePath,
  t,
} from '../../src/lib/i18n';

describe('i18n helpers', () => {
  it('expõe os locais suportados', () => {
    expect(LOCALES).toEqual(['pt', 'en']);
    expect(DEFAULT_LOCALE).toBe('pt');
  });

  it('isLocale valida corretamente', () => {
    expect(isLocale('pt')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('getLocaleFromPath extrai o locale do primeiro segmento', () => {
    expect(getLocaleFromPath('/pt')).toBe('pt');
    expect(getLocaleFromPath('/en/')).toBe('en');
    expect(getLocaleFromPath('/pt/algo')).toBe('pt');
    expect(getLocaleFromPath('/')).toBe(DEFAULT_LOCALE);
    expect(getLocaleFromPath('/desconhecido')).toBe(DEFAULT_LOCALE);
  });

  it('otherLocale alterna entre pt e en', () => {
    expect(otherLocale('pt')).toBe('en');
    expect(otherLocale('en')).toBe('pt');
  });

  it('switchLocalePath troca o segmento de locale', () => {
    expect(switchLocalePath('/pt', 'en')).toBe('/en');
    expect(switchLocalePath('/pt/', 'en')).toBe('/en/');
    expect(switchLocalePath('/en/artigos', 'pt')).toBe('/pt/artigos');
  });

  it('switchLocalePath prefixa quando não há locale no path', () => {
    expect(switchLocalePath('/algo', 'en')).toBe('/en/algo');
  });

  it('t retorna a string quando existe', () => {
    const s = { hello: 'Olá' };
    expect(t(s, 'hello')).toBe('Olá');
  });

  it('t usa fallback quando a chave falta ou está vazia', () => {
    const s = { hello: '' };
    const fb = { hello: 'Hello', bye: 'Bye' };
    expect(t(s, 'hello', fb)).toBe('Hello');
    expect(t(s, 'bye', fb)).toBe('Bye');
  });

  it('t retorna a própria chave quando não há tradução nem fallback', () => {
    expect(t({}, 'missing')).toBe('missing');
  });
});
