/** Uma instituição e as certificações dela. */
export interface CertificationGroup<T> {
  issuer: string;
  items: T[];
}

/**
 * Agrupa certificações por `issuer`, preservando a ordem de entrada: cada grupo
 * aparece na posição da sua primeira certificação na lista já ordenada por
 * `getCertifications()` (order asc → ano desc), e os itens dentro do grupo
 * mantêm essa mesma ordem. Helper puro (sem dependência de `astro:content`)
 * para poder ser testado — ver `tests/unit/certifications.test.ts`.
 */
export function groupCertificationsByIssuer<T extends { issuer: string }>(
  items: T[],
): CertificationGroup<T>[] {
  const groups: CertificationGroup<T>[] = [];
  const indexByIssuer = new Map<string, number>();
  for (const item of items) {
    let idx = indexByIssuer.get(item.issuer);
    if (idx === undefined) {
      idx = groups.length;
      indexByIssuer.set(item.issuer, idx);
      groups.push({ issuer: item.issuer, items: [] });
    }
    groups[idx].items.push(item);
  }
  return groups;
}
