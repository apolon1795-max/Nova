import assert from 'node:assert/strict';
import test from 'node:test';
import { handler } from './index.js';
import { makeValidLead } from './test-fixture.js';

test('stores a lead and returns an idempotent receipt', async () => {
  const original = {
    mode: process.env.LEAD_STORAGE_MODE,
    origins: process.env.ALLOWED_ORIGINS,
    token: process.env.TELEGRAM_BOT_TOKEN,
    chat: process.env.TELEGRAM_CHAT_ID,
  };
  process.env.LEAD_STORAGE_MODE = 'memory';
  process.env.ALLOWED_ORIGINS = 'https://novatoria-quiz-2026.website.yandexcloud.net|https://nova-pi-eosin.vercel.app';
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;

  const lead = makeValidLead();
  const event = {
    httpMethod: 'POST',
    headers: { origin: 'https://nova-pi-eosin.vercel.app', 'x-lead-id': lead.leadId },
    body: JSON.stringify(lead),
  };

  try {
    const first = await handler(event);
    const second = await handler(event);
    assert.equal(first.statusCode, 201);
    assert.equal(second.statusCode, 200);
    const firstBody = JSON.parse(first.body);
    const secondBody = JSON.parse(second.body);
    assert.equal(firstBody.stored, true);
    assert.equal(firstBody.leadId, lead.leadId);
    assert.equal(firstBody.notifications.telegram, 'skipped');
    assert.equal(secondBody.duplicate, true);
  } finally {
    if (original.mode === undefined) delete process.env.LEAD_STORAGE_MODE;
    else process.env.LEAD_STORAGE_MODE = original.mode;
    if (original.origins === undefined) delete process.env.ALLOWED_ORIGINS;
    else process.env.ALLOWED_ORIGINS = original.origins;
    if (original.token === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = original.token;
    if (original.chat === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = original.chat;
  }
});

test('rejects an unlisted origin', async () => {
  const original = process.env.ALLOWED_ORIGINS;
  process.env.ALLOWED_ORIGINS = 'https://nova-pi-eosin.vercel.app';
  try {
    const response = await handler({
      httpMethod: 'POST',
      headers: { origin: 'https://example.com' },
      body: JSON.stringify(makeValidLead()),
    });
    assert.equal(response.statusCode, 403);
  } finally {
    if (original === undefined) delete process.env.ALLOWED_ORIGINS;
    else process.env.ALLOWED_ORIGINS = original;
  }
});
