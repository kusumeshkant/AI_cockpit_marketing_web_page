import { expect, test } from '@playwright/test';
import { onRequest } from '../functions/api/demo-callback';

/**
 * The do-nothing agent callback used by the Play review demo agent, exercised
 * directly: no browser, no network.
 */

const ENDPOINT = 'https://aicockpit.dqstore.in/api/demo-callback';

const decision = JSON.stringify({
  action_id: 'act_123',
  decision: 'approved',
  payload: { to: 'someone@example.com', subject: 'Hello' },
});

test('a POSTed decision gets 204 with no body', async () => {
  const response = await onRequest({
    request: new Request(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Cockpit-Signature': 'sha256=abc' },
      body: decision,
    }),
  });

  expect(response.status).toBe(204);
  expect(await response.text()).toBe('');
  expect(response.headers.get('cache-control')).toBe('no-store');
});

test('the body is never read', async () => {
  const request = new Request(ENDPOINT, { method: 'POST', body: decision });
  const read = { text: false, json: false, arrayBuffer: false };
  request.text = async () => ((read.text = true), '');
  request.json = async () => ((read.json = true), {});
  request.arrayBuffer = async () => ((read.arrayBuffer = true), new ArrayBuffer(0));

  const response = await onRequest({ request });

  expect(response.status).toBe(204);
  expect(read).toEqual({ text: false, json: false, arrayBuffer: false });
});

test('nothing is logged', async () => {
  const lines: unknown[] = [];
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  const capture = (...args: unknown[]) => lines.push(args);
  Object.assign(console, { log: capture, info: capture, warn: capture, error: capture });
  try {
    await onRequest({ request: new Request(ENDPOINT, { method: 'POST', body: decision }) });
    await onRequest({ request: new Request(ENDPOINT, { method: 'GET' }) });
  } finally {
    Object.assign(console, original);
  }
  expect(lines).toEqual([]);
});

for (const method of ['GET', 'PUT', 'DELETE']) {
  test(`${method} is refused with 405`, async () => {
    const response = await onRequest({
      request: new Request(ENDPOINT, { method, ...(method === 'GET' ? {} : { body: '{}' }) }),
    });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
    expect(await response.text()).toBe('');
  });
}
