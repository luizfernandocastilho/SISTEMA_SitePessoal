-- Arquivos disponíveis para download (registro; o binário vive no volume privado).
CREATE TABLE IF NOT EXISTS files (
  id          TEXT PRIMARY KEY,            -- slug/fileId referenciado pelo site
  title       TEXT NOT NULL,
  filename    TEXT NOT NULL,               -- nome do arquivo em STORAGE_DIR
  mime        TEXT NOT NULL DEFAULT 'application/pdf',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solicitações de download (a "lista de e-mails" — item 3).
CREATE TABLE IF NOT EXISTS download_leads (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_id           TEXT NOT NULL REFERENCES files(id),
  file_title        TEXT NOT NULL,
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  token_hash        TEXT NOT NULL,
  token_expires_at  TIMESTAMPTZ NOT NULL,
  downloaded_at     TIMESTAMPTZ,
  consent_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_leads_token_hash ON download_leads (token_hash);
CREATE INDEX IF NOT EXISTS idx_download_leads_email ON download_leads (email);
CREATE INDEX IF NOT EXISTS idx_download_leads_requested_at ON download_leads (requested_at);
