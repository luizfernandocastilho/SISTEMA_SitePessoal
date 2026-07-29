# Deploy da API de download-gate no NAS

Guia passo a passo para publicar o serviço `api/` (Fastify + Postgres + SMTP) que implementa o
gate de download por e-mail. O site estático faz um `POST` de formulário nativo para
`POST /downloads/request`; a API grava o lead, envia um link tokenizado por e-mail e serve o
arquivo por `GET /downloads/:token`.

## Conceito-chave

Três valores precisam apontar para **a mesma URL pública HTTPS da API**:

- `PUBLIC_BASE_URL` (`.env` do backend) — usada para montar o link do e-mail.
- `PUBLIC_API_URL` (build do site) — vira o `action` do formulário.
- O destino do **reverse proxy / DNS**.

Nos exemplos usamos `https://api.luizcastilho.com` (fallback já embutido no site). Pode ser outro
subdomínio, desde que os três coincidam.

## Pré-requisitos

- NAS com **Docker + Docker Compose** (Synology "Container Manager"; QNAP "Container Station"; ou
  Portainer). Acesso **SSH** facilita.
- Um **subdomínio** para a API (ex.: `api.luizcastilho.com`) e acesso ao DNS do domínio.
- **Reverse proxy com HTTPS** (Synology embutido; ou Nginx Proxy Manager / Caddy / Traefik).
- **SMTP** (relay com SPF/DKIM/DMARC do domínio — ver passo 8).

---

## 1. Levar o código para o NAS

Só a pasta `api/` é necessária.

```bash
mkdir -p /volume1/docker/site-api && cd /volume1/docker/site-api
git clone https://github.com/luizfernandocastilho/site.git .
cd api
```

(ou copie apenas `api/` via File Station / rsync.)

## 2. Configurar o `.env`

```bash
cp .env.example .env
```

Edite e **troque todos os segredos**:

- `POSTGRES_PASSWORD` — senha forte.
- `DATABASE_URL` — mesma senha: `postgres://site:SUA_SENHA@postgres:5432/site_downloads`.
- `APP_SECRET` — aleatório forte (`openssl rand -hex 32`).
- `ADMIN_TOKEN` — token forte (para o CSV de leads).
- `PUBLIC_BASE_URL=https://api.luizcastilho.com` — **URL pública da API** (não deixe localhost).
- `SITE_URL=https://www.luizcastilho.com`.
- `SMTP_*` — ver passo 8 (deixe `SMTP_HOST` vazio por ora → "modo dev": link só logado).
- `API_PORT` — porta no host do NAS (3000 por padrão).

## 3. Colocar os arquivos gated em `storage/`

Os binários **não** ficam no git (só no NAS). Cada PDF gated vai em `api/storage/` com o
`filename` **exato** registrado em `src/seed.ts`:

```bash
cp /caminho/palestra_abilene_narrativa_clara.pdf storage/
ls storage/
```

> Cada arquivo gated precisa de uma entrada `{ id, title, filename }` em `src/seed.ts`
> (o deck Abilene já está lá como `abilene-falso-consenso`).

## 4. Subir os containers

```bash
docker compose up -d --build
```

Sobe **Postgres + API**; as **migrations rodam automaticamente** no boot da API.

```bash
docker compose ps            # ambos running/healthy
docker compose logs -f api   # "Migrations aplicadas: ..." + listen na 3000
```

## 5. Registrar os arquivos (seed)

```bash
docker compose exec api npm run seed
# → "Seed concluído: N arquivo(s) registrado(s)."
```

Idempotente; rode sempre que alterar `src/seed.ts`.

## 6. Healthcheck local (no NAS)

```bash
curl http://localhost:${API_PORT:-3000}/health   # → {"status":"ok"}
```

## 7. Expor por HTTPS (reverse proxy + DNS)

1. **DNS:** registro para `api.luizcastilho.com` → IP público (A/AAAA) ou host do NAS.
2. **Reverse proxy:** `https://api.luizcastilho.com` → `http://<IP-do-NAS>:${API_PORT}` (container
   na 3000), com TLS (Let's Encrypt).
   - _Synology:_ Painel de Controle → Portal de Login → Avançado → **Proxy Reverso**.
3. A API usa `trustProxy: true` — o rate limit (20 req/10 min) lê o IP real via `X-Forwarded-For`.
4. Teste externo: `curl https://api.luizcastilho.com/health`.

## 8. SMTP e entregabilidade

No `.env`, use um **relay/smarthost** (não um mailserver puro no IP do NAS — cai em spam):

```
SMTP_HOST=smtp.seu-relay.com
SMTP_PORT=587
SMTP_SECURE=false      # true se porta 465
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Luiz Castilho <no-reply@luizcastilho.com>
```

Configure **SPF, DKIM e DMARC** para `@luizcastilho.com`. Recarregue com `docker compose up -d`.
Com `SMTP_HOST` preenchido, o link passa a ser enviado por e-mail (antes só era logado).

## 9. Apontar o site para a API

O site lê `PUBLIC_API_URL` **no build** (embutido no `action` do formulário).

- **Se a API ficar em `https://api.luizcastilho.com`:** nada a fazer — é o fallback embutido; um
  novo deploy basta.
- **Se usar outra URL:** crie a _Repository variable_ `PUBLIC_API_URL` no GitHub
  (Settings → Secrets and variables → Actions → Variables). O `deploy.yml` já a injeta no build.
  Rode um novo deploy (push em `main` ou "Run workflow").

## 10. Teste ponta-a-ponta

1. `https://www.luizcastilho.com/pt/keynotes` → expanda "Baixar PDF", preencha nome/e-mail, marque
   o consentimento, envie.
2. Deve navegar para a **página de confirmação** da API.
3. Chega o e-mail com `https://api.luizcastilho.com/downloads/<token>` → baixa o PDF.
4. Sem SMTP (modo dev), o link aparece em `docker compose logs api`.

## 11. Admin: exportar leads

```bash
curl -H "Authorization: Bearer SEU_ADMIN_TOKEN" \
  https://api.luizcastilho.com/admin/leads.csv
```

## 12. Backups e atualizações

- **Backup:** volume `pgdata` (banco/leads) + pasta `storage/` (PDFs).
  ```bash
  docker compose exec postgres pg_dump -U site site_downloads > backup.sql
  ```
- **Atualizar:** `git pull && docker compose up -d --build` (migrations reaplicam sozinhas).

---

### Checklist rápido

`.env` com segredos reais → PDFs em `storage/` → `docker compose up -d --build` →
`docker compose exec api npm run seed` → `/health` ok → reverse proxy HTTPS + DNS →
SMTP + SPF/DKIM/DMARC → `PUBLIC_API_URL` do site batendo → teste ponta-a-ponta.
