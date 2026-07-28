/** URL da API de download-gate (backend separado). Configure via PUBLIC_API_URL. */
const API_BASE = (import.meta.env.PUBLIC_API_URL ?? 'https://api.luizcastilho.com').replace(
  /\/+$/,
  '',
);

/** Endpoint do formulário de solicitação (POST nativo, sem JS). */
export function apiRequestUrl(): string {
  return `${API_BASE}/downloads/request`;
}
