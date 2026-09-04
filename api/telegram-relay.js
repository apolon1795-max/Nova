const TELEGRAM_TIMEOUT_MS = 8_000;
const MAX_MESSAGE_LENGTH = 4_096;

function firstHeader(value) {
  return Array.isArray(value) ? value[0] : value;
}

function parseBody(body) {
  if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  if (typeof body !== 'string') return null;
  try { return JSON.parse(body); } catch { return null; }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const allowedChatId = process.env.NOVATORIA_TELEGRAM_CHAT_ID?.trim();
  if (!allowedChatId) return response.status(503).json({ ok: false, error: 'relay-not-configured' });

  const authorization = firstHeader(request.headers?.authorization)?.trim() ?? '';
  const botToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';
  if (!botToken) return response.status(401).json({ ok: false, error: 'unauthorized' });

  const body = parseBody(request.body);
  const chatId = typeof body?.chatId === 'string' ? body.chatId.trim() : '';
  const text = typeof body?.text === 'string' ? body.text : '';

  if (!/^\d{8,12}:[A-Za-z0-9_-]{30,}$/.test(botToken)
    || chatId !== allowedChatId
    || !text
    || text.length > MAX_MESSAGE_LENGTH) {
    return response.status(400).json({ ok: false, error: 'invalid-payload' });
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
    const telegramBody = await telegramResponse.json().catch(() => null);
    if (!telegramResponse.ok || telegramBody?.ok !== true) {
      return response.status(502).json({
        ok: false,
        error: 'telegram-rejected',
        errorCode: typeof telegramBody?.error_code === 'number' ? telegramBody.error_code : undefined,
      });
    }
    return response.status(200).json({ ok: true });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return response.status(timedOut ? 504 : 502).json({
      ok: false,
      error: timedOut ? 'telegram-timeout' : 'telegram-unavailable',
    });
  }
}
