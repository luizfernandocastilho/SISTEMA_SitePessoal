# Contract: Módulo de build de vídeos (`src/lib/youtube.ts`)

Contrato do módulo que obtém os vídeos do canal na **build** (FR-005/FR-006, SC-007). Executa
apenas em Node durante o build; nada aqui roda no navegador e a chave nunca é enviada ao cliente.

## Interface

```ts
export interface Video {
  id: string
  title: string
  thumbnail: string   // URL
  url: string         // https://www.youtube.com/watch?v={id}
  publishedAt: string // ISO
}

export interface FetchVideosOptions {
  channelId: string
  apiKey: string | undefined   // process.env.YOUTUBE_API_KEY
  maxVideos?: number           // default 6
  cachePath: string            // src/data/youtube-cache.json
}

// Retorna a lista de vídeos a exibir. NUNCA lança para não quebrar o build.
export async function getChannelVideos(opts: FetchVideosOptions): Promise<Video[]>
```

## Comportamento (regras)

1. **Sucesso**: consulta a *uploads playlist* do canal via YouTube Data API v3
   (`playlistItems.list`, `part=snippet`), normaliza para `Video[]`, limita a `maxVideos`,
   ordena por `publishedAt` desc, **grava** o resultado em `cachePath` e o retorna.
2. **Sem chave** (`apiKey` ausente): não chama a API; retorna o conteúdo de `cachePath` se existir,
   senão `[]`. Emite aviso no log de build.
3. **Falha da API / cota estourada / rede**: captura o erro, retorna o cache anterior se existir,
   senão `[]`. Nunca propaga exceção (edge case "API indisponível" / FR-011).
4. **Cache**: `youtube-cache.json` é a fonte de fallback determinística; commitado no repositório.
5. **Segurança**: a chave só é lida de variável de ambiente; não aparece na saída nem no cache.

## Contrato de exibição (consumidor)

- Lista vazia (`[]`) ⇒ a seção de vídeos é omitida sem quebrar o layout (FR-011).
- Cada vídeo renderiza título + miniatura com `alt`, link para o vídeo e link para o canal
  (FR-005), abrindo em nova aba (FR-012). Miniatura ausente degrada mantendo título + link.

## Casos de teste (Vitest, com `fetch` mockado)

| Caso                                   | Entrada                          | Saída esperada                          |
|----------------------------------------|----------------------------------|------------------------------------------|
| Resposta válida da API                 | payload com N itens              | `Video[]` normalizado, limitado a max    |
| `maxVideos` menor que itens retornados | 20 itens, max=6                  | 6 itens, ordenados por data desc         |
| Sem `apiKey` mas com cache             | apiKey=undefined, cache com 3    | os 3 do cache                            |
| Sem `apiKey` e sem cache               | apiKey=undefined, sem cache      | `[]`                                     |
| API retorna erro/HTTP 403 (cota)       | fetch rejeita/403, cache com 3   | os 3 do cache; nenhuma exceção           |
| API falha e sem cache                  | fetch rejeita, sem cache         | `[]`; nenhuma exceção                    |
| Item sem thumbnail                     | snippet sem thumbnails           | `thumbnail` vazio; item ainda presente   |
