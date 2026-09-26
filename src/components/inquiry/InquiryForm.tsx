'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { inquiry, TURNSTILE_SITE_KEY } from '@/content/site';
import {
  firstName,
  LIMITS,
  validateInquiry,
  type CallTime,
  type FieldErrors,
  type InquiryInput,
  type Role,
  type Tool,
} from '@/lib/inquiry';
import { cn } from '../ui/cn';
import { Button } from '../ui/Button';
import { CheckIcon } from '../ui/icons';
import { Turnstile, type TurnstileHandle } from './Turnstile';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY: InquiryInput = {
  name: '',
  phone: '+91 ',
  email: '',
  company: '',
  role: '',
  tools: [],
  bestTime: '',
  message: '',
  consent: false,
  website: '',
};

const fieldBase =
  'bg-bg border-line text-ink placeholder:text-muted/70 w-full rounded-(--radius-btn) border px-3.5 py-2.5 text-body outline-none transition-colors focus-visible:border-accent';

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: string;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-ink text-body-s mb-1.5 block font-semibold">
      {children}
      {optional ? <span className="text-muted ml-1.5 font-normal">{inquiry.optional}</span> : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-stop text-body-s mt-1.5">
      {message}
    </p>
  );
}

/**
 * The demo inquiry form. Rendered both inside the dialog and in the
 * `#request-demo` section, so it owns no layout of its own.
 *
 * Nothing here is ever logged: the values go straight from state into one POST.
 */
export function InquiryForm({ onDone }: { onDone?: () => void }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [values, setValues] = useState<InquiryInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const turnstile = useRef<TurnstileHandle>(null);
  const startedAt = useRef<number>(0);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Seeded on mount, not during render: Date.now() is impure, and the timing
  // check only cares about how long the form was actually on screen.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Move the user to whichever outcome they need to read.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    else if (status === 'error') summaryRef.current?.focus();
  }, [status]);

  function set<K extends keyof InquiryInput>(key: K, value: InquiryInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function toggleTool(tool: Tool) {
    const next = values.tools?.includes(tool)
      ? (values.tools ?? []).filter((t) => t !== tool)
      : [...(values.tools ?? []), tool];
    set('tools', next);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const check = validateInquiry(values);
    if (!check.ok) {
      setErrors(check.errors);
      setFormError(inquiry.errors.summary);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setFormError(null);

    try {
      const token = await turnstile.current?.getToken();

      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, startedAt: startedAt.current, turnstileToken: token }),
      });

      if (res.ok) {
        setStatus('success');
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        errors?: FieldErrors;
        error?: string;
      } | null;

      if (res.status === 400 && body?.errors) {
        setErrors(body.errors);
        setFormError(inquiry.errors.summary);
      } else if (res.status === 429) {
        setFormError(inquiry.errors.rateLimited);
      } else if (res.status === 403) {
        setFormError(inquiry.errors.turnstile);
        turnstile.current?.reset();
      } else {
        setFormError(inquiry.errors.generic);
      }
      setStatus('error');
    } catch {
      setFormError(inquiry.errors.network);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-4 outline-none"
      >
        <span className="bg-go-bg text-go flex size-12 items-center justify-center rounded-full">
          <CheckIcon className="size-6" />
        </span>
        <h3 className="text-h3 text-ink">
          {inquiry.success.title.replace('{name}', firstName(values.name))}
        </h3>
        <p className="text-body text-ink-soft">{inquiry.success.body}</p>
        {onDone ? (
          <Button variant="secondary" onClick={onDone} className="mt-2">
            {inquiry.close}
          </Button>
        ) : null}
      </div>
    );
  }

  const remaining = LIMITS.messageMax - (values.message?.length ?? 0);
  const busy = status === 'submitting';

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <p
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="bg-stop-bg text-stop text-body-s rounded-(--radius-btn) px-3.5 py-3 outline-none"
        >
          {formError}
        </p>
      ) : null}

      {/* Honeypot: off-screen, not hidden, so bots still see and fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={id('website')}>{inquiry.fields.website.label}</label>
        <input
          id={id('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => set('website', e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={id('name')}>{inquiry.fields.name.label}</Label>
          <input
            id={id('name')}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={LIMITS.nameMax}
            placeholder={inquiry.fields.name.placeholder}
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? id('name-error') : undefined}
            className={cn(fieldBase, errors.name && 'border-stop')}
          />
          <FieldError id={id('name-error')} message={errors.name} />
        </div>

        <div>
          <Label htmlFor={id('phone')}>{inquiry.fields.phone.label}</Label>
          <input
            id={id('phone')}
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder={inquiry.fields.phone.placeholder}
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? id('phone-error') : id('phone-hint')}
            className={cn(fieldBase, errors.phone && 'border-stop')}
          />
          {errors.phone ? (
            <FieldError id={id('phone-error')} message={errors.phone} />
          ) : (
            <p id={id('phone-hint')} className="text-muted text-body-s mt-1.5">
              {inquiry.fields.phone.hint}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor={id('email')} optional>
            {inquiry.fields.email.label}
          </Label>
          <input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={LIMITS.emailMax}
            placeholder={inquiry.fields.email.placeholder}
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? id('email-error') : undefined}
            className={cn(fieldBase, errors.email && 'border-stop')}
          />
          <FieldError id={id('email-error')} message={errors.email} />
        </div>

        <div>
          <Label htmlFor={id('company')} optional>
            {inquiry.fields.company.label}
          </Label>
          <input
            id={id('company')}
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={LIMITS.companyMax}
            placeholder={inquiry.fields.company.placeholder}
            value={values.company}
            onChange={(e) => set('company', e.target.value)}
            className={cn(fieldBase, errors.company && 'border-stop')}
          />
          <FieldError id={id('company-error')} message={errors.company} />
        </div>

        <div>
          <Label htmlFor={id('role')} optional>
            {inquiry.fields.role.label}
          </Label>
          <select
            id={id('role')}
            name="role"
            value={values.role}
            onChange={(e) => set('role', e.target.value as Role | '')}
            className={cn(fieldBase, 'appearance-none')}
          >
            <option value="">{inquiry.fields.role.placeholder}</option>
            {inquiry.fields.role.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor={id('bestTime')} optional>
            {inquiry.fields.bestTime.label}
          </Label>
          <select
            id={id('bestTime')}
            name="bestTime"
            value={values.bestTime}
            onChange={(e) => set('bestTime', e.target.value as CallTime | '')}
            className={cn(fieldBase, 'appearance-none')}
          >
            <option value="">{inquiry.fields.bestTime.placeholder}</option>
            {inquiry.fields.bestTime.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="text-ink text-body-s mb-2 font-semibold">
          {inquiry.fields.tools.label}
          <span className="text-muted ml-1.5 font-normal">{inquiry.optional}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {inquiry.fields.tools.options.map((tool) => {
            const active = values.tools?.includes(tool.value as Tool) ?? false;
            return (
              <button
                key={tool.value}
                type="button"
                aria-pressed={active}
                onClick={() => toggleTool(tool.value as Tool)}
                className={cn(
                  'text-body-s min-h-11 rounded-(--radius-pill) border px-4 transition-colors',
                  active
                    ? 'bg-accent-wash border-accent text-accent-ink'
                    : 'border-line text-ink-soft hover:border-line-strong',
                )}
              >
                {tool.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <Label htmlFor={id('message')} optional>
          {inquiry.fields.message.label}
        </Label>
        <textarea
          id={id('message')}
          name="message"
          rows={4}
          maxLength={LIMITS.messageMax}
          placeholder={inquiry.fields.message.placeholder}
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          aria-describedby={id('message-counter')}
          className={cn(fieldBase, 'resize-y', errors.message && 'border-stop')}
        />
        <p id={id('message-counter')} aria-live="polite" className="text-muted text-body-s mt-1.5">
          {remaining} {inquiry.fields.message.counter}
        </p>
      </div>

      <div>
        <label htmlFor={id('consent')} className="flex cursor-pointer items-start gap-3">
          <input
            id={id('consent')}
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={(e) => set('consent', e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? id('consent-error') : undefined}
            className="accent-accent mt-0.5 size-5 shrink-0"
          />
          <span className="text-body-s text-ink-soft">
            {inquiry.fields.consent.label}{' '}
            <a href="/privacy" className="text-accent-bright underline">
              {inquiry.fields.consent.privacyLabel}
            </a>
          </span>
        </label>
        <FieldError id={id('consent-error')} message={errors.consent} />
      </div>

      <Turnstile ref={turnstile} siteKey={TURNSTILE_SITE_KEY} />

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? (
          <>
            <span
              aria-hidden="true"
              className="border-bg/40 border-t-bg mr-1 size-4 animate-spin rounded-full border-2"
            />
            {inquiry.submitting}
          </>
        ) : (
          inquiry.submit
        )}
      </Button>
    </form>
  );
}
