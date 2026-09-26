/**
 * The demo-inquiry contract, shared by the browser form and the Pages Function.
 *
 * Pure TypeScript with no runtime dependencies, so the same rules run in both
 * places and the two can never drift. The client validates for fast feedback;
 * the server validates because the client cannot be trusted.
 */

export const ROLES = ['consultant', 'business', 'developer', 'other'] as const;
export type Role = (typeof ROLES)[number];

export const TOOLS = ['n8n', 'make', 'zapier', 'custom', 'none'] as const;
export type Tool = (typeof TOOLS)[number];

export const CALL_TIMES = ['morning', 'afternoon', 'evening'] as const;
export type CallTime = (typeof CALL_TIMES)[number];

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  phoneDigitsMin: 7,
  phoneDigitsMax: 15,
  emailMax: 254,
  companyMax: 120,
  messageMax: 1000,
  /** Largest body the endpoint will read, in bytes. */
  bodyBytesMax: 10 * 1024,
  /** A human cannot complete the form faster than this. */
  minFillMs: 3000,
  /** Submissions allowed per IP per hour. */
  rateLimitPerHour: 5,
} as const;

/** The shape the browser posts. Anything else is rejected. */
export interface InquiryInput {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  role?: Role | '';
  tools?: Tool[];
  bestTime?: CallTime | '';
  message?: string;
  consent: boolean;
  /** Honeypot — must stay empty. */
  website?: string;
  /** Client timestamp when the form was first rendered. */
  startedAt?: number;
  turnstileToken?: string;
}

export const INQUIRY_FIELDS = [
  'name',
  'phone',
  'email',
  'company',
  'role',
  'tools',
  'bestTime',
  'message',
  'consent',
  'website',
  'startedAt',
  'turnstileToken',
] as const;

export type FieldErrors = Partial<Record<keyof InquiryInput, string>>;

/** Digits only, so `+91 98765 43210` and `+919876543210` are the same number. */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Deliberately loose: a stricter pattern rejects valid international numbers,
 * and the cost of a bad number is one failed call, not a security hole.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface ValidationResult {
  ok: boolean;
  errors: FieldErrors;
  /** Present only when `ok` — normalised, with unknown fields dropped. */
  value?: Required<Pick<InquiryInput, 'name' | 'phone' | 'consent'>> & {
    email: string;
    company: string;
    role: Role | '';
    tools: Tool[];
    bestTime: CallTime | '';
    message: string;
  };
}

/** Messages live here so the form and the API report failures identically. */
export const MESSAGES = {
  nameRequired: 'Please tell us your name.',
  nameLength: `Name must be between ${LIMITS.nameMin} and ${LIMITS.nameMax} characters.`,
  phoneRequired: 'Please add a phone or WhatsApp number.',
  phoneInvalid: 'That does not look like a phone number.',
  emailInvalid: 'That does not look like an email address.',
  emailLength: 'That email address is too long.',
  companyLength: `Keep this under ${LIMITS.companyMax} characters.`,
  roleInvalid: 'Please pick one of the listed options.',
  toolsInvalid: 'Please pick from the listed tools.',
  bestTimeInvalid: 'Please pick one of the listed times.',
  messageLength: `Keep this under ${LIMITS.messageMax} characters.`,
  consentRequired: 'Please agree to be contacted so we can reply.',
} as const;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Validates and normalises a submission.
 *
 * Unknown keys are ignored here; the endpoint rejects them before calling this,
 * so the two together fail closed. The honeypot and timing checks are deliberately
 * *not* handled here — they are spam signals, not user-correctable errors, and
 * the server answers them without telling a bot which one tripped.
 */
export function validateInquiry(raw: unknown): ValidationResult {
  const errors: FieldErrors = {};
  const input = (raw ?? {}) as Record<string, unknown>;

  const name = asString(input.name);
  if (!name) errors.name = MESSAGES.nameRequired;
  else if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax)
    errors.name = MESSAGES.nameLength;

  const phone = asString(input.phone);
  const digits = phoneDigits(phone);
  // The field is prefilled with a country code, so "+91" on its own means the
  // visitor never typed a number — that is missing, not malformed.
  const onlyCountryCode = /^\+\d{0,3}$/.test(phone.replace(/[\s()-]/g, ''));
  if (!phone || onlyCountryCode) errors.phone = MESSAGES.phoneRequired;
  else if (digits.length < LIMITS.phoneDigitsMin || digits.length > LIMITS.phoneDigitsMax)
    errors.phone = MESSAGES.phoneInvalid;

  const email = asString(input.email);
  if (email && email.length > LIMITS.emailMax) errors.email = MESSAGES.emailLength;
  else if (email && !EMAIL_RE.test(email)) errors.email = MESSAGES.emailInvalid;

  const company = asString(input.company);
  if (company.length > LIMITS.companyMax) errors.company = MESSAGES.companyLength;

  const role = asString(input.role) as Role | '';
  if (role && !ROLES.includes(role as Role)) errors.role = MESSAGES.roleInvalid;

  const rawTools = Array.isArray(input.tools) ? input.tools : [];
  const tools = rawTools.filter(
    (t): t is Tool => typeof t === 'string' && TOOLS.includes(t as Tool),
  );
  if (tools.length !== rawTools.length) errors.tools = MESSAGES.toolsInvalid;

  const bestTime = asString(input.bestTime) as CallTime | '';
  if (bestTime && !CALL_TIMES.includes(bestTime as CallTime))
    errors.bestTime = MESSAGES.bestTimeInvalid;

  const message = asString(input.message);
  if (message.length > LIMITS.messageMax) errors.message = MESSAGES.messageLength;

  const consent = input.consent === true;
  if (!consent) errors.consent = MESSAGES.consentRequired;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    value: { name, phone, email, company, role, tools, bestTime, message, consent: true },
  };
}

/**
 * Spam heuristics the user never sees. Kept separate from validation so a real
 * visitor with a slow connection is never shown a confusing error, and a bot is
 * never told which signal caught it.
 */
export function looksAutomated(input: {
  website?: unknown;
  startedAt?: unknown;
  now?: number;
}): boolean {
  // Honeypot: a field hidden from humans that bots fill in anyway.
  if (asString(input.website) !== '') return true;

  const startedAt = typeof input.startedAt === 'number' ? input.startedAt : 0;
  const now = input.now ?? Date.now();
  // A missing or future timestamp is suspicious; so is an instant submit.
  if (!startedAt || startedAt > now) return true;
  if (now - startedAt < LIMITS.minFillMs) return true;

  return false;
}

/** First name for the success message; falls back to the whole string. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name.trim();
}
