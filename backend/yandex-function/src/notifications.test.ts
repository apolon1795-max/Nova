import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNotificationText, sendTelegram } from './notifications.js';
import { makeValidLead } from './test-fixture.js';

test('skips Telegram when no credentials are configured', async () => {
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChat = process.env.TELEGRAM_CHAT_ID;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
  try {
    assert.equal(await sendTelegram(makeValidLead()), 'skipped');
  } finally {
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalToken;
    if (originalChat === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = originalChat;
  }
});

test('escapes Telegram HTML and includes the parent phone', () => {
  const lead = makeValidLead();
  lead.result.skills = ['Логика <систем>', 'Стратегия', 'Фокус'];
  const message = buildNotificationText(lead, true);
  assert.match(message, /Телефон родителя/);
  assert.doesNotMatch(message, /<систем>/);
  assert.match(message, /&lt;систем&gt;/);
});
