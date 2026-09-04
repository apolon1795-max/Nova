import { setDefaultResultOrder } from 'node:dns';
import { LeadSubmission, NotificationDelivery } from './types.js';

const TELEGRAM_TIMEOUT_MS = 8_000;
setDefaultResultOrder('ipv4first');

export type TelegramStatus = Exclude<NotificationDelivery, 'pending'>;

function envFlag(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return value === '1' || value === 'true' || value === 'yes';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildNotificationText(payload: LeadSubmission, includeContacts: boolean): string {
  const lines = [
    '<b>Новая заявка · тест Новатории</b>',
    `Результат: <b>${escapeHtml(payload.result.entrepreneurName)}</b>`,
    `Тип: ${escapeHtml(payload.result.archetype)}`,
    `Сильные стороны: ${escapeHtml(payload.result.skills.join(', '))}`,
  ];

  if (includeContacts) {
    lines.push(`Телефон родителя: <code>${escapeHtml(payload.contact.parentPhone)}</code>`);
  } else {
    lines.push('Телефон сохранён в защищённом реестре YDB.');
  }
  lines.push(`ID: <code>${escapeHtml(payload.leadId)}</code>`);
  return lines.join('\n');
}

export async function sendTelegram(payload: LeadSubmission): Promise<TelegramStatus> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token && !chatId) return 'skipped';
  if (!token || !chatId) return 'failed';

  const text = buildNotificationText(payload, envFlag('TELEGRAM_INCLUDE_CONTACTS', true));
  const relayUrl = process.env.TELEGRAM_RELAY_URL?.trim();

  try {
    const response = relayUrl
      ? await fetch(relayUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ chatId, text }),
          signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
        })
      : await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
          signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
        });

    const body = await response.json().catch(() => null) as { ok?: unknown } | null;
    return response.ok && body?.ok === true ? 'sent' : 'failed';
  } catch (error) {
    console.error('Telegram notification failed', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return 'failed';
  }
}
