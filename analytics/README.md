# Analytics (Umami self-hosted)

Estatísticas de tráfego e navegação do site, **privacy-first e cookieless**, com
[Umami](https://umami.is). Roda no NAS (Docker) e é exposto publicamente via **Tailscale
Funnel** — o site estático (GitHub Pages) apenas carrega o `script.js` do tracker.

Serviço independente do site e da API de download-gate (`api/`). Implantado no épico #173.

## Arquitetura

```
navegador do visitante
        │  GET /script.js   (+ POST /api/send)
        ▼
https://nas-castilho.tailb53d63.ts.net     ← Tailscale Funnel (HTTPS público, cert automático)
        │  proxy → 127.0.0.1:3001
        ▼
  container umami  ──►  container db (postgres 16, volume umami-db)
```

- **Por que Funnel, e não um reverse proxy + domínio próprio?** O NAS não tem reverse
  proxy, o DSM (Synology) já ocupa a porta 443 do host, e o IP residencial é **dinâmico**.
  O Funnel resolve tudo isso: HTTPS público com certificado automático, sem abrir portas
  no roteador e sem DDNS. A URL fica num domínio `*.ts.net` — irrelevante para o visitante,
  já que é apenas o `src` de um `<script>`.
- **Porta 3001**: o Umami escuta só em `127.0.0.1:3001` (a `3000` é da `api/`). Nada é
  exposto na LAN; a única porta pública é a do Funnel.

## Subir a stack (no NAS)

```bash
cd analytics
cp .env.example .env
#   edite .env: gere UMAMI_APP_SECRET e UMAMI_DB_PASSWORD (openssl rand -hex 32)
chmod 600 .env
sudo docker compose up -d          # migrations rodam no boot
```

Teste local (esperado HTTP 200):

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/
```

## Expor via Tailscale Funnel

Pré-requisito: Funnel habilitado no tailnet (admin console do Tailscale) para o nó.

```bash
sudo tailscale funnel --bg 3001                       # público 443 → 127.0.0.1:3001
sudo tailscale cert nas-castilho.tailb53d63.ts.net    # pré-emite o certificado
sudo tailscale funnel status                          # deve mostrar "Funnel on"
```

Desligar a exposição pública: `sudo tailscale funnel --https=443 off`.

## Conectar ao site

O site injeta o snippet do Umami **apenas** quando estas duas _repository variables_
existem (Settings → Secrets and variables → Actions → Variables do repo `site`):

| Variable                  | Valor                                                      |
| ------------------------- | ---------------------------------------------------------- |
| `PUBLIC_UMAMI_SRC`        | `https://nas-castilho.tailb53d63.ts.net/script.js`         |
| `PUBLIC_UMAMI_WEBSITE_ID` | o UUID do website criado no painel (`Settings → Websites`) |

Sem elas (dev/preview/forks), o site fica sem tracking. Ver `BaseLayout.astro` e a seção
_Analytics_ do `CLAUDE.md`.

## Operação

```bash
cd analytics
sudo docker compose ps                     # containers no ar? (db healthy)
sudo docker compose logs --tail=50 umami   # logs do Umami
sudo docker compose pull && sudo docker compose up -d   # atualizar imagem
```

- **Painel**: `https://nas-castilho.tailb53d63.ts.net` (login admin; troque a senha padrão).
- **Backup**: o que importa é o volume `umami-db` (mesma rotina do Postgres da `api/`).
- **Se o tracking parar**: confira `docker compose ps` e `sudo tailscale funnel status`.
