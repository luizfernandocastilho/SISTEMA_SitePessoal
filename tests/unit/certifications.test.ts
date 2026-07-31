import { describe, it, expect } from 'vitest';
import { groupCertificationsByIssuer } from '../../src/lib/certifications';

const cert = (name: string, issuer: string, year: number) => ({ name, issuer, year });

describe('groupCertificationsByIssuer', () => {
  it('agrupa certificações da mesma instituição juntas', () => {
    const groups = groupCertificationsByIssuer([
      cert('A', 'PMI', 2024),
      cert('B', 'PMI', 2023),
      cert('C', 'Miro', 2022),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toEqual({
      issuer: 'PMI',
      items: [cert('A', 'PMI', 2024), cert('B', 'PMI', 2023)],
    });
    expect(groups[1]).toEqual({ issuer: 'Miro', items: [cert('C', 'Miro', 2022)] });
  });

  it('preserva a ordem de entrada mesmo com instituições intercaladas', () => {
    const groups = groupCertificationsByIssuer([
      cert('A', 'PMI', 2024),
      cert('B', 'Miro', 2024),
      cert('C', 'PMI', 2023),
    ]);
    // O grupo aparece na posição da sua PRIMEIRA certificação; os itens mantêm a ordem.
    expect(groups.map((g) => g.issuer)).toEqual(['PMI', 'Miro']);
    expect(groups[0].items.map((c) => c.name)).toEqual(['A', 'C']);
    expect(groups[1].items.map((c) => c.name)).toEqual(['B']);
  });

  it('retorna lista vazia para entrada vazia', () => {
    expect(groupCertificationsByIssuer([])).toEqual([]);
  });
});
