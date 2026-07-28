import nodemailer, { type Transporter } from 'nodemailer';
import { config } from './config.js';

let transport: Transporter | null = null;
function getTransport(): Transporter | null {
  if (transport) return transport;
  if (!config.smtp.host) return null; // modo dev: sem SMTP, apenas loga
  transport = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
  return transport;
}

interface DownloadEmail {
  to: string;
  name: string;
  fileTitle: string;
  url: string;
  locale: 'pt' | 'en';
}

export async function sendDownloadLink(msg: DownloadEmail): Promise<void> {
  const pt = msg.locale === 'pt';
  const subject = pt ? `Seu download: ${msg.fileTitle}` : `Your download: ${msg.fileTitle}`;
  const greeting = pt ? `Olá, ${msg.name}` : `Hello, ${msg.name}`;
  const line = pt
    ? `Aqui está o link para baixar “${msg.fileTitle}”:`
    : `Here is your link to download “${msg.fileTitle}”:`;
  const note = pt
    ? 'O link é pessoal e expira em alguns dias.'
    : 'This link is personal and expires in a few days.';
  const text = `${greeting}\n\n${line}\n${msg.url}\n\n${note}`;
  const html =
    `<p>${greeting},</p><p>${line}</p>` +
    `<p><a href="${msg.url}">${msg.url}</a></p>` +
    `<p style="color:#55605a;font-size:14px">${note}</p>`;

  const t = getTransport();
  if (!t) {
    // Sem SMTP configurado (dev): registra o link para inspeção/teste.
    console.log(`[mailer:dev] → ${msg.to} | ${subject} | ${msg.url}`);
    return;
  }
  await t.sendMail({ from: config.smtp.from, to: msg.to, subject, text, html });
}
