# Deploy da API de download-gate no NAS

Guia passo a passo para publicar o serviço `api/` (Fastify + Postgres + SMTP) que implementa o
gate de download por e-mail. O site estático faz um `POST` de formulário nativo para
`POST /downloads/request`; a API grava o lead, envia um link tokenizado por e-mail e serve o
arquivo por `GET /downloads/:token`.

> **Arquitetura em produção (2026-08):** a API é exposta por **Tailscale Funnel** na porta **8443**
> (`https://nas-castilho.tailb53d63.ts.net:8443`), não por um domínio próprio + reverse proxy. O NAS
> (Synology) não tem reverse proxy e o IP residencial é dinâmico; o Funnel dá HTTPS público com
> certificado automático, sem abrir portas nem DDNS — o mesmo caminho usado pelo analytics (Umami).
> O SMTP é o **Brevo**, com o domínio `luizcastilho.com` autenticado (DKIM/SPF).

## Conceito-chave

Dois valores precisam apontar para **a mesma URL pública HTTPS da API**:

- `PUBLIC_BASE_URL` (`.env` do backend) — usada para montar o link do e-mail.
- `PUBLIC_API_URL` (build do site) — vira o `action` do formulário.

Em produção ambos são `https://nas-castilho.tailb53d63.ts.net:8443`. O fallback embutido no site
(`https://api.luizcastilho.com`) **não resolve** — a _Repository variable_ `PUBLIC_API_URL` é
obrigatória (ver passo 9).

## Pré-requisitos

- NAS com **Docker + Docker Compose** (aqui: Synology, acesso **SSH**; Docker exige `sudo`).
- **Tailscale** instalado no NAS, com **Funnel habilitado** no tailnet (admin console). Já usado
  pelo Umami — ver `analytics/README.md`.
- **SMTP** — conta **Brevo** (grátis) com o **domínio autenticado** (SPF/DKIM) para boa entrega.

---

## 1. Levar o código para o NAS

O repositório é clonado por inteiro (o `api/` fica em `.../site-api/api`).

```bash
# local atual em produção:
cd /volume1/homes/admin_castilho/site-api        # git clone do repo `site`
cd api
```

## 2. Configurar o `.env`

```bash
cp .env.example .env
```

Edite e **troque todos os segredos**:

- `POSTGRES_PASSWORD` — senha forte.
- `DATABASE_URL` — mesma senha: `postgres://site:SUA_SENHA@postgres:5432/site_downloads`.
- `APP_SECRET` — aleatório forte (`openssl rand -hex 32`).
- `ADMIN_TOKEN` — token forte (para o CSV de leads).
- `PUBLIC_BASE_URL=https://nas-castilho.tailb53d63.ts.net:8443` — **URL pública da API** (a do
  Funnel; nunca localhost — senão o link do e-mail sai quebrado).
- `SITE_URL=https://www.luizcastilho.com`.
- `SMTP_*` — ver passo 8 (Brevo). Vazio = "modo dev": link só logado, sem enviar.
- `API_PORT` — porta no host do NAS (3000 por padrão).

## 3. Colocar os arquivos gated em `storage/`

Os binários **não** ficam no git (só no NAS). Cada PDF gated vai em `api/storage/` com o
`filename` registrado para o `fileId` correspondente:

```bash
cp /caminho/palestra_abilene_narrativa_clara.pdf storage/
ls storage/
```

> Cada arquivo gated precisa de um registro na tabela `files` (ver passo 5). O `fileId` usado no
> conteúdo do site (`src/content/**`) deve bater com o `id` registrado.

## 4. Subir os containers

```bash
sudo docker compose up -d --build
```

Sobe **Postgres + API**; as **migrations rodam automaticamente** no boot da API.

```bash
sudo docker compose ps            # ambos running/healthy
sudo docker compose logs -f api   # "Migrations aplicadas: ..." + listen na 3000
```

## 5. Registrar os arquivos (seed)

```bash
sudo docker compose exec api npm run seed
# → "Seed concluído: N arquivo(s) registrado(s)."
```

Idempotente; rode sempre que adicionar/alterar um arquivo gated.

## 6. Healthcheck local (no NAS)

```bash
curl http://127.0.0.1:${API_PORT:-3000}/health   # → {"status":"ok"}
```

## 7. Expor por HTTPS (Tailscale Funnel)

A API roda em `127.0.0.1:3000`; o Funnel a publica na internet na porta **8443** (o Umami usa a
443 no mesmo nó). Pré-requisito: Funnel habilitado no tailnet.

```bash
sudo tailscale funnel --https=8443 --bg 3000
sudo tailscale cert nas-castilho.tailb53d63.ts.net   # pré-emite o certificado (uma vez)
sudo tailscale funnel status                         # deve listar :8443 → 127.0.0.1:3000
```

- A config do Funnel é **persistente** (sobrevive a reboot/fechar terminal).
- Desligar: `sudo tailscale funnel --https=8443 off`.
- A API usa `trustProxy: true` — o rate limit (20 req/10 min) lê o IP via `X-Forwarded-For`.
- Teste externo (de fora do tailnet): `curl https://nas-castilho.tailb53d63.ts.net:8443/health`.

## 8. SMTP e entregabilidade (Brevo)

No painel do Brevo: **SMTP & API → SMTP** (gere uma _SMTP key_) e **Senders, Domains & IPs →
Domains** (autentique `luizcastilho.com` com os registros DKIM/SPF no DNS da GoDaddy). No `.env`:

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<login-brevo>@smtp-brevo.com
SMTP_PASS=<sua-SMTP-key>
SMTP_FROM=Luiz Castilho <no-reply@luizcastilho.com>
```

Com o domínio autenticado, `no-reply@luizcastilho.com` entrega na caixa de entrada. Recarregue com
`sudo docker compose up -d`. Com `SMTP_HOST` vazio, o link é só logado (modo dev).

## 9. Apontar o site para a API

O site lê `PUBLIC_API_URL` **no build** (embutido no `action` do formulário). Como o fallback
(`api.luizcastilho.com`) está morto, a variable é **obrigatória**:

- _Repository variable_ `PUBLIC_API_URL=https://nas-castilho.tailb53d63.ts.net:8443` no GitHub
  (Settings → Secrets and variables → Actions → Variables). O `deploy.yml` já a injeta no build.
- Rode um novo deploy (push em `main` ou "Run workflow").

## 10. Teste ponta-a-ponta

1. `https://www.luizcastilho.com/pt/keynotes` → expanda "Baixar PDF", preencha nome/e-mail, marque
   o consentimento, envie.
2. Deve navegar para a **página de confirmação** da API.
3. Chega o e-mail com `https://nas-castilho.tailb53d63.ts.net:8443/downloads/<token>` → baixa o PDF.
4. Sem SMTP (modo dev), o link aparece em `sudo docker compose logs api`.

## 11. Admin: exportar leads

```bash
curl -H "Authorization: Bearer SEU_ADMIN_TOKEN" \
  https://nas-castilho.tailb53d63.ts.net:8443/admin/leads.csv
```

## 12. Backups e atualizações

- **Backup:** volume `pgdata` (banco/leads) + pasta `storage/` (PDFs).
  ```bash
  sudo docker compose exec postgres pg_dump -U site site_downloads > backup.sql
  ```
- **Atualizar:** `git pull && sudo docker compose up -d --build` (migrations reaplicam sozinhas).

---

### Checklist rápido

`.env` com segredos reais + `PUBLIC_BASE_URL` do Funnel → PDFs em `storage/` →
`sudo docker compose up -d --build` → `sudo docker compose exec api npm run seed` → `/health` ok →
`sudo tailscale funnel --https=8443 --bg 3000` → SMTP Brevo (domínio autenticado) →
`PUBLIC_API_URL` do site = URL do Funnel → teste ponta-a-ponta.
