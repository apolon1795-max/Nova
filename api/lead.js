const UPSTREAM_TIMEOUT_MS = 20_000;
const MAX_BODY_LENGTH = 50_000;
const DEFAULT_YANDEX_LEAD_ENDPOINT = 'https://functions.yandexcloud.net/d4ehppuj1qvhbg70337s';
const DEFAULT_PUBLIC_ORIGIN = 'https://nova-pi-eosin.vercel.app';

function firstHeader(value) {
  return Array.isArray(value) ? value[0] : value;
}

function parseBody(body) {
  if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  if (typeof body !== 'string') return null;

  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function serverConfig() {
  const endpoint = process.env.YANDEX_LEAD_ENDPOINT?.trim() || DEFAULT_YANDEX_LEAD_ENDPOINT;
  const origin = process.env.NOVATORIA_PUBLIC_ORIGIN?.trim() || DEFAULT_PUBLIC_ORIGIN;

  try {
    const parsedEndpoint = new URL(endpoint);
    const parsedOrigin = new URL(origin);
    if (parsedEndpoint.protocol !== 'https:' || parsedOrigin.protocol !== 'https:') return null;
    return { endpoint: parsedEndpoint.toString(), origin: parsedOrigin.origin };
  } catch {
    return null;
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method-not-allowed' });
  }

  const config = serverConfig();
  if (!config) return response.status(503).json({ error: 'lead-service-not-configured', message: 'Сервис заявок настроен некорректно' });

  const body = parseBody(request.body);
  if (!body) return response.status(400).json({ error: 'invalid-json' });

  const serializedBody = JSON.stringify(body);
  if (serializedBody.length > MAX_BODY_LENGTH) {
    return response.status(413).json({ error: 'payload-too-large' });
  }

  const requestLeadId = firstHeader(request.headers?.['x-lead-id'])?.trim();
  if (requestLeadId && requestLeadId !== body.leadId) {
    return response.status(400).json({ error: 'lead-id-mismatch' });
  }

  try {
    const upstream = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: config.origin,
        ...(requestLeadId ? { 'X-Lead-Id': requestLeadId } : {}),
      },
      body: serializedBody,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const upstreamBody = await upstream.json().catch(() => null);

    if (!upstreamBody || typeof upstreamBody !== 'object') {
      return response.status(502).json({ error: 'invalid-upstream-response' });
    }
    return response.status(upstream.status).json(upstreamBody);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return response.status(timedOut ? 504 : 502).json({
      error: timedOut ? 'upstream-timeout' : 'upstream-unavailable',
    });
  }
}
