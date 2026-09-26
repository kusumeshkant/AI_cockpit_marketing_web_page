import { expect, test } from '@playwright/test';
import {
  firstName,
  LIMITS,
  looksAutomated,
  phoneDigits,
  validateInquiry,
} from '../src/lib/inquiry';

/** A submission that should always pass, so each case varies one thing. */
const valid = {
  name: 'Asha Menon',
  phone: '+91 98765 43210',
  consent: true,
};

test.describe('validateInquiry', () => {
  test('accepts the minimum required fields', () => {
    const result = validateInquiry(valid);
    expect(result.ok).toBe(true);
    expect(result.value?.name).toBe('Asha Menon');
    expect(result.value?.email).toBe('');
    expect(result.value?.tools).toEqual([]);
  });

  test('requires name, phone and consent', () => {
    const result = validateInquiry({});
    expect(result.ok).toBe(false);
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.phone).toBeTruthy();
    expect(result.errors.consent).toBeTruthy();
  });

  test('rejects consent that is merely truthy', () => {
    expect(validateInquiry({ ...valid, consent: 'yes' }).ok).toBe(false);
    expect(validateInquiry({ ...valid, consent: 1 }).ok).toBe(false);
  });

  test.describe('phone', () => {
    const cases: [string, boolean][] = [
      ['+91 98765 43210', true],
      ['+919876543210', true],
      ['9876543210', true],
      ['+1 (415) 555-0123', true],
      ['+44 20 7946 0958', true],
      ['12345', false], // too few digits
      ['+91 9876543210987654', false], // too many digits
      ['not a phone', false],
      ['', false],
    ];

    for (const [phone, ok] of cases) {
      test(`${ok ? 'accepts' : 'rejects'} ${JSON.stringify(phone)}`, () => {
        expect(validateInquiry({ ...valid, phone }).ok).toBe(ok);
      });
    }

    test('counts digits regardless of formatting', () => {
      expect(phoneDigits('+91 98765-43210')).toBe('919876543210');
    });
  });

  test.describe('email', () => {
    test('is optional', () => {
      expect(validateInquiry({ ...valid, email: '' }).ok).toBe(true);
    });

    test('is validated when present', () => {
      expect(validateInquiry({ ...valid, email: 'not-an-email' }).ok).toBe(false);
      expect(validateInquiry({ ...valid, email: 'a@b.co' }).ok).toBe(true);
    });

    test('rejects an over-long address', () => {
      const long = `${'a'.repeat(LIMITS.emailMax)}@example.com`;
      expect(validateInquiry({ ...valid, email: long }).ok).toBe(false);
    });
  });

  test('bounds the name length', () => {
    expect(validateInquiry({ ...valid, name: 'A' }).ok).toBe(false);
    expect(validateInquiry({ ...valid, name: 'A'.repeat(LIMITS.nameMax + 1) }).ok).toBe(false);
  });

  test('bounds the message length', () => {
    expect(validateInquiry({ ...valid, message: 'x'.repeat(LIMITS.messageMax) }).ok).toBe(true);
    expect(validateInquiry({ ...valid, message: 'x'.repeat(LIMITS.messageMax + 1) }).ok).toBe(
      false,
    );
  });

  test('rejects values outside the listed options', () => {
    expect(validateInquiry({ ...valid, role: 'ceo' }).ok).toBe(false);
    expect(validateInquiry({ ...valid, bestTime: 'midnight' }).ok).toBe(false);
    expect(validateInquiry({ ...valid, tools: ['n8n', 'excel'] }).ok).toBe(false);
    expect(validateInquiry({ ...valid, tools: ['n8n', 'zapier'] }).ok).toBe(true);
  });

  test('trims whitespace', () => {
    const result = validateInquiry({ ...valid, name: '  Asha Menon  ', company: '  Acme  ' });
    expect(result.value?.name).toBe('Asha Menon');
    expect(result.value?.company).toBe('Acme');
  });
});

test.describe('looksAutomated', () => {
  const now = 1_700_000_000_000;
  const human = { startedAt: now - LIMITS.minFillMs - 1, now };

  test('passes a human who took their time', () => {
    expect(looksAutomated(human)).toBe(false);
  });

  test('catches a filled honeypot', () => {
    expect(looksAutomated({ ...human, website: 'https://spam.example' })).toBe(true);
  });

  test('catches an instant submit', () => {
    expect(looksAutomated({ startedAt: now - 100, now })).toBe(true);
  });

  test('catches a missing or future timestamp', () => {
    expect(looksAutomated({ now })).toBe(true);
    expect(looksAutomated({ startedAt: now + 10_000, now })).toBe(true);
  });
});

test('firstName takes the first word', () => {
  expect(firstName('Asha Menon')).toBe('Asha');
  expect(firstName('  Asha  ')).toBe('Asha');
  expect(firstName('Asha')).toBe('Asha');
});

test.describe('phone prefill', () => {
  test('treats a bare country code as missing, not malformed', () => {
    const result = validateInquiry({ ...valid, phone: '+91 ' });
    expect(result.ok).toBe(false);
    expect(result.errors.phone).toBe('Please add a phone or WhatsApp number.');
  });

  test('still accepts a real number with that prefix', () => {
    expect(validateInquiry({ ...valid, phone: '+91 98765 43210' }).ok).toBe(true);
  });
});
