import assert from 'node:assert/strict';
import test from 'node:test';
import handler from './lead.js';

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

test('accepts only POST requests', async () => {
  const response = makeResponse();
  await handler({ method: 'GET', headers: {} }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
});

test('uses the published Yandex endpoint when the environment override is missing', async () => {
  const originalFetch = globalThis.fetch;
  const original = process.env.YANDEX_LEAD_ENDPOINT;
  delete process.env.YANDEX_LEAD_ENDPOINT;
  let requestedUrl = '';
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({ stored: true, leadId: 'fallback-test' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  const response = makeResponse();
  try {
    await handler({ method: 'POST', headers: {}, body: { leadId: 'fallback-test' } }, response);
    assert.equal(requestedUrl, 'https://functions.yandexcloud.net/d4ehppuj1qvhbg70337s');
    assert.equal(response.statusCode, 201);
  } finally {
    globalThis.fetch = originalFetch;
    if (original === undefined) delete process.env.YANDEX_LEAD_ENDPOINT;
    else process.env.YANDEX_LEAD_ENDPOINT = original;
  }
});

test('forwards a lead with the production origin', async () => {
  const originalFetch = globalThis.fetch;
  const originalEndpoint = process.env.YANDEX_LEAD_ENDPOINT;
  const originalOrigin = process.env.NOVATORIA_PUBLIC_ORIGIN;
  const lead = { schemaVersion: 1, leadId: 'test-lead' };
  let requestedUrl = '';
  let requestInit;

  process.env.YANDEX_LEAD_ENDPOINT = 'https://functions.yandexcloud.net/test-function';
  process.env.NOVATORIA_PUBLIC_ORIGIN = 'https://nova-pi-eosin.vercel.app';
  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestInit = init;
    return new Response(JSON.stringify({ stored: true, leadId: lead.leadId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const response = makeResponse();
  try {
    await handler({
      method: 'POST',
      headers: { 'x-lead-id': lead.leadId },
      body: lead,
    }, response);
    assert.equal(requestedUrl, 'https://functions.yandexcloud.net/test-function');
    assert.equal(new Headers(requestInit?.headers).get('Origin'), 'https://nova-pi-eosin.vercel.app');
    assert.equal(new Headers(requestInit?.headers).get('X-Lead-Id'), lead.leadId);
    assert.deepEqual(JSON.parse(String(requestInit?.body)), lead);
    assert.equal(response.statusCode, 201);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEndpoint === undefined) delete process.env.YANDEX_LEAD_ENDPOINT;
    else process.env.YANDEX_LEAD_ENDPOINT = originalEndpoint;
    if (originalOrigin === undefined) delete process.env.NOVATORIA_PUBLIC_ORIGIN;
    else process.env.NOVATORIA_PUBLIC_ORIGIN = originalOrigin;
  }
});

test('rejects a mismatched request lead id', async () => {
  const original = process.env.YANDEX_LEAD_ENDPOINT;
  process.env.YANDEX_LEAD_ENDPOINT = 'https://functions.yandexcloud.net/test-function';
  const response = makeResponse();
  try {
    await handler({
      method: 'POST',
      headers: { 'x-lead-id': 'another-lead' },
      body: { schemaVersion: 1, leadId: 'test-lead' },
    }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.payload.error, 'lead-id-mismatch');
  } finally {
    if (original === undefined) delete process.env.YANDEX_LEAD_ENDPOINT;
    else process.env.YANDEX_LEAD_ENDPOINT = original;
  }
});
