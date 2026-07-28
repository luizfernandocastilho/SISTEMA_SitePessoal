# Download API (gate por e-mail)

Serviço separado (roda no NAS via Docker) que implementa o **gate de download por
e-mail** do site: o interessado informa nome + e-mail, recebe um **link tokenizado** por
e-mail e só então acessa o arquivo. Cada solicitação é registrada no **Postgres** (a
"lista de e-mails").

O site (Astro/GitHub Pages) permanece estático e apenas envia um `POST` (formulário
nativo) para `POST /downloads/request` desta API.

## Stack
Fastify + Postgres (`pg`) + Nodemailer (SMTP). TypeScript rodando via `tsx` (sem etapa de
build em produção).

## Rodar localmente (Docker)
```bash
cp .env.example .env        # ajuste segredos
docker compose up --build   # sobe postgres + api (migrations rodam no boot)
# registrar arquivos de exemplo (após colocar os PDFs em ./storage):
docker compose exec api npm run seed
curl localhost:3000/health  # {"status":"ok"}
```

## Endpoints
- `GET /health` — liveness.
- `POST /downloads/request` — body `file_id`, `name`, `email`, `consent`, `locale?`
  (form-urlencoded). Grava o lead, gera token (validade `TOKEN_TTL_HOURS`) e envia o link
  por e-mail. Responde página de confirmação.
- `GET /downloads/:token` — valida o token e serve o arquivo do storage privado.
- `GET /admin/leads.csv` — exporta a lista (CSV). Requer header
  `Authorization: Bearer $ADMIN_TOKEN`.

## Modelo de dados
- `files` — registro dos arquivos (`id` = fileId usado pelo site → `filename` no storage).
- `download_leads` — `file_id`, `file_title`, `name`, `email`, `requested_at`,
  `token_hash` (nunca o token bruto), `token_expires_at`, `downloaded_at`, `consent_at`.

## Segurança / operação
- Token: 256 bits, opaco; no banco guardamos só o **hash SHA-256**.
- Rate limit global (20 / 10 min) no endpoint público.
- Arquivos ficam **fora do site** (volume `./storage`, servido só via token).
- **Segredos** (`APP_SECRET`, `ADMIN_TOKEN`, Postgres, SMTP) vêm do `.env`/secrets — não
  versionados.
- **E-mail/entregabilidade:** `SMTP_HOST` vazio = modo dev (link só logado). Em produção,
  use um relay/smarthost com **SPF/DKIM/DMARC** de `@luizcastilho.com` — mailserver puro
  em IP de NAS tende a cair em spam.

## Deploy no NAS (resumo)
1. `.env` com segredos reais e `DATABASE_URL` do Postgres do NAS.
2. `docker compose up -d --build`.
3. Colocar os arquivos em `storage/` e `npm run seed` (ou registrar via migration).
4. Expor a API por HTTPS (reverse proxy) e apontar `PUBLIC_API_URL` do site para ela.
