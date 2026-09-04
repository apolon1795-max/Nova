import assert from 'node:assert/strict';
import test from 'node:test';
import handler from './telegram-relay.js';

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test('fails closed when the allowed chat is missing', async () => {
  const original = process.env.NOVATORIA_TELEGRAM_CHAT_ID;
  delete process.env.NOVATORIA_TELEGRAM_CHAT_ID;
  const response = makeResponse();
  try {
    await handler({ method: 'POST', headers: {}, body: {} }, response);
    assert.equal(response.statusCode, 503);
  } finally {
    if (original === undefined) delete process.env.NOVATORIA_TELEGRAM_CHAT_ID;
    else process.env.NOVATORIA_TELEGRAM_CHAT_ID = original;
  }
});

test('rejects requests without bot-token authorization', async () => {
  const original = process.env.NOVATORIA_TELEGRAM_CHAT_ID;
  process.env.NOVATORIA_TELEGRAM_CHAT_ID = '-100123';
  const response = makeResponse();
  try {
    await handler({ method: 'POST', headers: {}, body: {} }, response);
    assert.equal(response.statusCode, 401);
  } finally {
    if (original === undefined) delete process.env.NOVATORIA_TELEGRAM_CHAT_ID;
    else process.env.NOVATORIA_TELEGRAM_CHAT_ID = original;
  }
});

test('forwards an authenticated message only to the configured chat', async () => {
  const originalFetch = globalThis.fetch;
  const originalChat = process.env.NOVATORIA_TELEGRAM_CHAT_ID;
  let forwardedBody;
  process.env.NOVATORIA_TELEGRAM_CHAT_ID = '-100123';
  globalThis.fetch = async (_input, init) => {
    forwardedBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const response = makeResponse();
  try {
    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer 123456789:test_token_abcdefghijklmnopqrstuvwxyz' },
      body: { chatId: '-100123', text: 'Новая заявка Новатории' },
    }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(forwardedBody, {
      chat_id: '-100123',
      text: 'Новая заявка Новатории',
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalChat === undefined) delete process.env.NOVATORIA_TELEGRAM_CHAT_ID;
    else process.env.NOVATORIA_TELEGRAM_CHAT_ID = originalChat;
  }
});
