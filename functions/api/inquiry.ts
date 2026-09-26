/**
 * POST /api/inquiry — the demo request endpoint.
 *
 * A Cloudflare Pages Function. The site itself stays a static export; this is
 * the only server-side code.
 *
 * Order matters: cheap rejections first (method, origin, configuration, size,
 * shape), then the spam signals, then Turnstile, then validation, then the rate
 * limit, then the write. Verification happens before anything is stored.
 *
 * Production and previews are deliberately not equivalent. On `main` the
 * endpoint fails closed: if any secret it needs is missing it returns 500
 * rather than quietly accepting unverified submissions. Only a preview may skip
 * Turnstile, and only when the secret is genuinely absent.
 *
 * Nothing a visitor typed is ever logged — not on success, not on failure. The
 * only thing written to the console is a short non-PII error code.
 */
import {
  INQUIRY_FIELDS,
  LIMITS,
  looksAutomated,
  validateInquiry,
  type Tool,
} from '../../src/lib/inquiry';

export interface Env {
  DB: D1Database;
  /** Injected by Pages at runtime; the branch this deployment was built from. */
  CF_PAGES_BRANCH?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  INQUIRY_TO_EMAIL?: string;
  INQUIRY_FROM_EMAIL?: string;
  /** Optional; falls back to the Turnstile secret so the hash is never unsalted. */
  IP_HASH_SALT?: string;
}

interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
}
interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(column?: string) => Promise<T | null>;
  run: () => Promise<unknown>;
}

type Ctx = { request: Request; env: Env };

/** Secrets the endpoint refuses to run without in production. */
const REQUIRED_IN_PRODUCTION = [
  'TURNSTILE_SECRET_KEY',
  'RESEND_API_KEY',
  'INQUIRY_FROM_EMAIL',
  'INQUIRY_TO_EMAIL',
] as const;

/**
 * Production is the `main` deployment — and anything we cannot positively
 * identify as a preview. An absent branch name means we cannot prove this is a
 * preview, so it gets the strict path rather than the lenient one.
 *
 * For `wrangler pages dev`, set CF_PAGES_BRANCH=local in .dev.vars.
 */
function isProduction(env: Env): boolean {
  const branch = typeof env.CF_PAGES_BRANCH === 'string' ? env.CF_PAGES_BRANCH.trim() : '';
  return branch === '' || branch === 'main';
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Short, non-identifying codes — safe to log. */
function logCode(code: string) {
  console.log(`inquiry:${code}`);
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyTurnstile(env: Env, token: string | undefined, ip: string): Promise<boolean> {
  // Only a preview may run without Turnstile, and only when the secret is
  // genuinely absent. Production never reaches this branch: the configuration
  // gate has already returned 500 if the secret is missing.
  if (!env.TURNSTILE_SECRET_KEY) return !isProduction(env);
  if (!token) return false;

  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    logCode('turnstile_unreachable');
    return false;
  }
}

/** IST, because that is where the calls get made from. */
function istTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

const TOOL_LABELS: Record<Tool, string> = {
  n8n: 'n8n',
  make: 'Make',
  zapier: 'Zapier',
  custom: 'Custom code',
  none: 'Not using agents yet',
};

const ROLE_LABELS: Record<string, string> = {
  consultant: 'Automation consultant / agency',
  business: 'Business owner',
  developer: 'Developer',
  other: 'Other',
};

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning (IST)',
  afternoon: 'Afternoon (IST)',
  evening: 'Evening (IST)',
};

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

/**
 * Sends the notification. Both addresses come from the environment so neither
 * appears in a public repository.
 */
async function sendNotification(
  env: Env,
  value: NonNullable<ReturnType<typeof validateInquiry>['value']>,
  receivedAt: Date,
): Promise<void> {
  // Previews are clearly marked so a test inquiry is never mistaken for a lead.
  const subjectPrefix = isProduction(env) ? '' : '[PREVIEW] ';
  if (!env.RESEND_API_KEY || !env.INQUIRY_TO_EMAIL || !env.INQUIRY_FROM_EMAIL) {
    logCode('email_not_configured');
    return;
  }

  const rows: [string, string][] = [
    ['Name', value.name],
    ['Phone', value.phone],
    ['Email', value.email || '—'],
    ['Company', value.company || '—'],
    ['Role', value.role ? (ROLE_LABELS[value.role] ?? value.role) : '—'],
    ['Tools', value.tools.length ? value.tools.map((t) => TOOL_LABELS[t]).join(', ') : '—'],
    ['Best time', value.bestTime ? (TIME_LABELS[value.bestTime] ?? value.bestTime) : '—'],
    ['Message', value.message || '—'],
    ['Received', `${istTimestamp(receivedAt)} IST`],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#667;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table>`;

  // No role given means no brackets at all — "(n/a)" in a subject line reads
  // like something broke.
  const roleLabel = value.role ? (ROLE_LABELS[value.role] ?? value.role) : '';
  const roleSuffix = roleLabel ? ` (${roleLabel})` : '';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.INQUIRY_FROM_EMAIL,
        to: [env.INQUIRY_TO_EMAIL],
        subject: `${subjectPrefix}New demo request — ${value.name}${roleSuffix}`,
        text,
        html,
        ...(value.email ? { reply_to: value.email } : {}),
      }),
    });
    if (!res.ok) logCode(`email_failed_${res.status}`);
  } catch {
    logCode('email_error');
  }
}

export const onRequest = async ({ request, env }: Ctx): Promise<Response> => {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405);
  }

  // Same-origin only. Comparing against the request's own host keeps this
  // correct on production, previews and localhost without a hard-coded list.
  const origin = request.headers.get('Origin');
  if (!origin || new URL(origin).host !== new URL(request.url).host) {
    logCode('bad_origin');
    return json({ ok: false, error: 'forbidden' }, 403);
  }

  // Fail closed in production: better a visible 500 than silently accepting
  // submissions that were never verified, or losing them because no email can
  // be sent. The code is all that is logged — never which secret is missing.
  if (isProduction(env) && REQUIRED_IN_PRODUCTION.some((key) => !env[key])) {
    logCode('server_misconfigured');
    return json({ ok: false, error: 'server_misconfigured' }, 500);
  }

  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > LIMITS.bodyBytesMax) {
    return json({ ok: false, error: 'payload_too_large' }, 413);
  }

  const raw = await request.text();
  if (raw.length > LIMITS.bodyBytesMax) {
    return json({ ok: false, error: 'payload_too_large' }, 413);
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json({ ok: false, error: 'bad_json' }, 400);
  }

  const unknown = Object.keys(body).filter(
    (key) => !(INQUIRY_FIELDS as readonly string[]).includes(key),
  );
  if (unknown.length > 0) {
    logCode('unknown_fields');
    return json({ ok: false, error: 'unknown_fields' }, 400);
  }

  // Spam signals answer with the same generic success shape as a real submit,
  // so a bot learns nothing about which check caught it.
  if (looksAutomated({ website: body.website, startedAt: body.startedAt })) {
    logCode('automated');
    return json({ ok: true }, 200);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? '';

  if (!(await verifyTurnstile(env, body.turnstileToken as string | undefined, ip))) {
    logCode('turnstile_failed');
    return json({ ok: false, error: 'turnstile_failed' }, 403);
  }

  const check = validateInquiry(body);
  if (!check.ok || !check.value) {
    return json({ ok: false, errors: check.errors }, 400);
  }
  const value = check.value;

  // The raw address is never stored — only a salted one-way hash, which is
  // enough to count submissions per source.
  const salt = env.IP_HASH_SALT ?? env.TURNSTILE_SECRET_KEY ?? 'ai-cockpit';
  const ipHash = await sha256Hex(`${salt}:${ip}`);

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM inquiry WHERE ip_hash = ? AND created_at > ?',
  )
    .bind(ipHash, since)
    .first<{ n: number }>();

  if ((recent?.n ?? 0) >= LIMITS.rateLimitPerHour) {
    logCode('rate_limited');
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  const receivedAt = new Date();

  try {
    await env.DB.prepare(
      `INSERT INTO inquiry
         (created_at, name, phone, email, company, role, tools, best_time, message, ip_hash, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        receivedAt.toISOString(),
        value.name,
        value.phone,
        value.email || null,
        value.company || null,
        value.role || null,
        value.tools.length ? value.tools.join(',') : null,
        value.bestTime || null,
        value.message || null,
        ipHash,
        (request.headers.get('User-Agent') ?? '').slice(0, 300) || null,
      )
      .run();
  } catch {
    logCode('db_insert_failed');
    return json({ ok: false, error: 'server' }, 500);
  }

  // The row is safely stored, so a failed email must not fail the request —
  // the visitor has done their part and the inquiry is not lost.
  await sendNotification(env, value, receivedAt);

  return json({ ok: true }, 200);
};
