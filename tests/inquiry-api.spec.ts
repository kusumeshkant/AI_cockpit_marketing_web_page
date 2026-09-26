import { expect, test } from '@playwright/test';
import { onRequest, type Env } from '../functions/api/inquiry';
import { LIMITS } from '../src/lib/inquiry';

/**
 * The Pages Function, exercised directly with Turnstile, D1 and Resend mocked.
 * No browser and no network — every outbound call is intercepted.
 */

const ORIGIN = 'https://aicockpit.dqstore.in';

interface Recorded {
  inserts: unknown[][];
  emails: { from?: string; to?: string[]; subject?: string; reply_to?: string }[];
  turnstileCalls: number;
}

/** A D1 stub that records inserts and answers the rate-limit count. */
function makeDb(recent = 0) {
  const inserts: unknown[][] = [];
  const db = {
    prepare(query: string) {
      const statement = {
        _bound: [] as unknown[],
        bind(...values: unknown[]) {
          statement._bound = values;
          return statement;
        },
        async first<T>() {
          return { n: recent } as T;
        },
        async run() {
          if (query.includes('INSERT')) inserts.push(statement._bound);
          return {};
        },
      };
      return statement;
    },
  };
  return { db, inserts };
}

function makeEnv(overrides: Partial<Env> = {}, recent = 0) {
  const { db, inserts } = makeDb(recent);
  const env = {
    DB: db,
    CF_PAGES_BRANCH: 'feat/preview',
    TURNSTILE_SECRET_KEY: 'turnstile-secret',
    RESEND_API_KEY: 'resend-key',
    INQUIRY_TO_EMAIL: 'inbox@example.test',
    INQUIRY_FROM_EMAIL: 'AI Cockpit <noreply@example.test>',
    IP_HASH_SALT: 'salt',
    ...overrides,
  } as unknown as Env;
  return { env, inserts };
}

/** Replaces global fetch for the duration of one test. */
function mockFetch(opts: { turnstileOk?: boolean; resendStatus?: number } = {}) {
  const recorded: Recorded = { inserts: [], emails: [], turnstileCalls: 0 };
  const original = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('challenges.cloudflare.com')) {
      recorded.turnstileCalls += 1;
      return new Response(JSON.stringify({ success: opts.turnstileOk ?? true }), { status: 200 });
    }
    if (url.includes('api.resend.com')) {
      recorded.emails.push(JSON.parse(String(init?.body ?? '{}')));
      return new Response('{}', { status: opts.resendStatus ?? 200 });
    }
    throw new Error(`unexpected fetch to ${url}`);
  }) as typeof fetch;

  return { recorded, restore: () => void (globalThis.fetch = original) };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}/api/inquiry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      'CF-Connecting-IP': '203.0.113.9',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const goodBody = {
  name: 'Asha Menon',
  phone: '+91 98765 43210',
  email: 'asha@example.test',
  role: 'consultant',
  tools: ['n8n'],
  consent: true,
  startedAt: Date.now() - LIMITS.minFillMs - 500,
  turnstileToken: 'token',
};

test('rejects non-POST methods', async () => {
  const res = await onRequest({
    request: new Request(`${ORIGIN}/api/inquiry`, { method: 'GET' }),
    env: makeEnv().env,
  });
  expect(res.status).toBe(405);
});

test('rejects a cross-origin post', async () => {
  const { restore } = mockFetch();
  const res = await onRequest({
    request: post(goodBody, { Origin: 'https://evil.example' }),
    env: makeEnv().env,
  });
  restore();
  expect(res.status).toBe(403);
});

test('rejects a body with unknown fields', async () => {
  const { restore } = mockFetch();
  const res = await onRequest({
    request: post({ ...goodBody, isAdmin: true }),
    env: makeEnv().env,
  });
  restore();
  expect(res.status).toBe(400);
  expect(await res.json()).toMatchObject({ error: 'unknown_fields' });
});

test('rejects an oversized body', async () => {
  const { restore } = mockFetch();
  const res = await onRequest({
    request: post({ ...goodBody, message: 'x'.repeat(LIMITS.bodyBytesMax + 100) }),
    env: makeEnv().env,
  });
  restore();
  expect(res.status).toBe(413);
});

test('accepts a valid submission, stores it and sends one email', async () => {
  const { recorded, restore } = mockFetch();
  const { env, inserts } = makeEnv();

  const res = await onRequest({ request: post(goodBody), env });
  restore();

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
  expect(recorded.turnstileCalls).toBe(1);
  expect(inserts).toHaveLength(1);
  expect(recorded.emails).toHaveLength(1);

  const email = recorded.emails[0]!;
  expect(email.from).toBe('AI Cockpit <noreply@example.test>');
  expect(email.to).toEqual(['inbox@example.test']);
  expect(email.subject).toContain('Asha Menon');
  expect(email.reply_to).toBe('asha@example.test');
});

test('never stores the raw IP address', async () => {
  const { restore } = mockFetch();
  const { env, inserts } = makeEnv();
  await onRequest({ request: post(goodBody), env });
  restore();

  const row = inserts[0]!.map(String).join('|');
  expect(row).not.toContain('203.0.113.9');
  // A 64-character hex hash is stored instead.
  expect(inserts[0]!.some((v) => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v))).toBe(true);
});

test('answers a honeypot hit with a plain success and stores nothing', async () => {
  const { recorded, restore } = mockFetch();
  const { env, inserts } = makeEnv();

  const res = await onRequest({
    request: post({ ...goodBody, website: 'https://spam.example' }),
    env,
  });
  restore();

  expect(res.status).toBe(200);
  expect(inserts).toHaveLength(0);
  expect(recorded.emails).toHaveLength(0);
  expect(recorded.turnstileCalls).toBe(0);
});

test('rejects a submit that was too fast to be human', async () => {
  const { restore } = mockFetch();
  const { env, inserts } = makeEnv();
  await onRequest({ request: post({ ...goodBody, startedAt: Date.now() }), env });
  restore();
  expect(inserts).toHaveLength(0);
});

test('rejects a failed Turnstile check before touching the database', async () => {
  const { restore } = mockFetch({ turnstileOk: false });
  const { env, inserts } = makeEnv();

  const res = await onRequest({ request: post(goodBody), env });
  restore();

  expect(res.status).toBe(403);
  expect(await res.json()).toMatchObject({ error: 'turnstile_failed' });
  expect(inserts).toHaveLength(0);
});

test('rejects a missing token when Turnstile is configured', async () => {
  const { restore } = mockFetch();
  const body = { ...goodBody };
  delete (body as Record<string, unknown>).turnstileToken;

  const res = await onRequest({ request: post(body), env: makeEnv().env });
  restore();
  expect(res.status).toBe(403);
});

test('returns field errors for an invalid submission', async () => {
  const { restore } = mockFetch();
  const res = await onRequest({
    request: post({ ...goodBody, name: '', phone: '123' }),
    env: makeEnv().env,
  });
  restore();

  expect(res.status).toBe(400);
  const body = (await res.json()) as { errors: Record<string, string> };
  expect(body.errors.name).toBeTruthy();
  expect(body.errors.phone).toBeTruthy();
});

test('rate limits once the hourly cap is reached', async () => {
  const { restore } = mockFetch();
  const { env, inserts } = makeEnv({}, LIMITS.rateLimitPerHour);

  const res = await onRequest({ request: post(goodBody), env });
  restore();

  expect(res.status).toBe(429);
  expect(await res.json()).toMatchObject({ error: 'rate_limited' });
  expect(inserts).toHaveLength(0);
});

test('still succeeds when the email fails, because the row is saved', async () => {
  const { restore } = mockFetch({ resendStatus: 500 });
  const { env, inserts } = makeEnv();

  const res = await onRequest({ request: post(goodBody), env });
  restore();

  expect(res.status).toBe(200);
  expect(inserts).toHaveLength(1);
});

test('skips Turnstile only when its own secret is unset', async () => {
  const { recorded, restore } = mockFetch();
  const body = { ...goodBody };
  delete (body as Record<string, unknown>).turnstileToken;

  const res = await onRequest({
    request: post(body),
    env: makeEnv({ TURNSTILE_SECRET_KEY: undefined }).env,
  });
  restore();

  expect(res.status).toBe(200);
  expect(recorded.turnstileCalls).toBe(0);
});

test('sends no email when the addresses are not configured', async () => {
  const { recorded, restore } = mockFetch();
  const { env, inserts } = makeEnv({ INQUIRY_TO_EMAIL: undefined, INQUIRY_FROM_EMAIL: undefined });

  const res = await onRequest({ request: post(goodBody), env });
  restore();

  expect(res.status).toBe(200);
  expect(inserts).toHaveLength(1);
  expect(recorded.emails).toHaveLength(0);
});

/**
 * Production and previews are deliberately not equivalent: `main` fails closed
 * on a missing secret, a preview may run without Turnstile, and preview email
 * is marked so a test inquiry is never mistaken for a lead.
 */
test.describe('production vs preview', () => {
  test('production refuses to run with a missing secret', async () => {
    const { restore } = mockFetch();

    for (const missing of [
      'TURNSTILE_SECRET_KEY',
      'RESEND_API_KEY',
      'INQUIRY_FROM_EMAIL',
      'INQUIRY_TO_EMAIL',
    ] as const) {
      const { env, inserts } = makeEnv({ CF_PAGES_BRANCH: 'main', [missing]: undefined });
      const res = await onRequest({ request: post(goodBody), env });

      expect(res.status, `${missing} missing should fail closed`).toBe(500);
      expect(await res.json()).toMatchObject({ error: 'server_misconfigured' });
      expect(inserts, `${missing} missing must store nothing`).toHaveLength(0);
    }

    restore();
  });

  test('production never skips Turnstile', async () => {
    const { recorded, restore } = mockFetch({ turnstileOk: false });
    const { env, inserts } = makeEnv({ CF_PAGES_BRANCH: 'main' });

    const res = await onRequest({ request: post(goodBody), env });
    restore();

    expect(res.status).toBe(403);
    expect(recorded.turnstileCalls).toBe(1);
    expect(inserts).toHaveLength(0);
  });

  test('production runs normally once every secret is present', async () => {
    const { recorded, restore } = mockFetch();
    const { env, inserts } = makeEnv({ CF_PAGES_BRANCH: 'main' });

    const res = await onRequest({ request: post(goodBody), env });
    restore();

    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
    expect(recorded.emails[0]!.subject).not.toContain('[PREVIEW]');
  });

  test('a missing branch name is treated as production', async () => {
    const { restore } = mockFetch();
    const { env } = makeEnv({ CF_PAGES_BRANCH: undefined, RESEND_API_KEY: undefined });

    const res = await onRequest({ request: post(goodBody), env });
    restore();

    expect(res.status).toBe(500);
  });

  test('a preview skips Turnstile only when the secret is absent', async () => {
    const { recorded, restore } = mockFetch();
    const body = { ...goodBody };
    delete (body as Record<string, unknown>).turnstileToken;

    const { env, inserts } = makeEnv({
      CF_PAGES_BRANCH: 'feat/demo-inquiry',
      TURNSTILE_SECRET_KEY: undefined,
    });

    const res = await onRequest({ request: post(body), env });
    restore();

    expect(res.status).toBe(200);
    expect(recorded.turnstileCalls).toBe(0);
    expect(inserts).toHaveLength(1);
  });

  test('a preview with the secret still verifies', async () => {
    const { recorded, restore } = mockFetch({ turnstileOk: false });
    const { env } = makeEnv({ CF_PAGES_BRANCH: 'feat/demo-inquiry' });

    const res = await onRequest({ request: post(goodBody), env });
    restore();

    expect(res.status).toBe(403);
    expect(recorded.turnstileCalls).toBe(1);
  });

  test('preview email is prefixed so it cannot be mistaken for a lead', async () => {
    const { recorded, restore } = mockFetch();
    const { env } = makeEnv({ CF_PAGES_BRANCH: 'feat/demo-inquiry' });

    await onRequest({ request: post(goodBody), env });
    restore();

    expect(recorded.emails[0]!.subject).toMatch(/^\[PREVIEW\] New demo request — /);
  });
});
