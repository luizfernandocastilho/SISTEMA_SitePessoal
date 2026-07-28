/** Páginas HTML mínimas (sem dependência de framework de view). Tema alinhado ao site. */

function page(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { margin:0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color:#1c221d; background:#fff; line-height:1.6; }
  .wrap { max-width: 40rem; margin: 12vh auto; padding: 0 1.25rem; }
  h1 { color:#2f7a3a; font-size: 1.6rem; margin:0 0 .5rem; }
  p { color:#2c332d; }
  a { color:#2f7a3a; }
</style>
</head>
<body><div class="wrap">${bodyHtml}</div></body>
</html>`;
}

export function confirmationPage(locale: 'pt' | 'en', siteUrl: string): string {
  const pt = locale === 'pt';
  const title = pt ? 'Verifique seu e-mail' : 'Check your email';
  const body = pt
    ? `<h1>Quase lá!</h1><p>Enviamos o link de download para o e-mail informado.
       Verifique também a caixa de spam.</p><p><a href="${siteUrl}">← Voltar ao site</a></p>`
    : `<h1>Almost there!</h1><p>We've sent the download link to your email.
       Please check your spam folder too.</p><p><a href="${siteUrl}">← Back to site</a></p>`;
  return page(title, body);
}

export function errorPage(locale: 'pt' | 'en', message: string): string {
  const pt = locale === 'pt';
  const title = pt ? 'Não foi possível concluir' : 'Something went wrong';
  return page(title, `<h1>${title}</h1><p>${message}</p>`);
}
