import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const OUT = join(process.cwd(), 'out');
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

async function htmlFiles(dir: string): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

/**
 * The deployed CSP is never exercised by the browser tests — `serve` ignores
 * `_headers` — so it is verified against the build output instead. Without this
 * the site would hydrate locally and silently fail to hydrate on Cloudflare.
 */
test.describe('exported _headers', () => {
  test('every inline script is covered by a CSP hash', async () => {
    const headers = await readFile(join(OUT, '_headers'), 'utf8');

    expect(headers, 'the build-time placeholder was never substituted').not.toContain(
      '__INLINE_SCRIPT_HASHES__',
    );

    const missing: string[] = [];
    let total = 0;

    for (const file of await htmlFiles(OUT)) {
      const html = await readFile(file, 'utf8');
      for (const [, , body] of html.matchAll(INLINE_SCRIPT)) {
        total += 1;
        const hash = `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;
        if (!headers.includes(hash)) missing.push(`${file}: ${hash}`);
      }
    }

    expect(total, 'expected the export to contain inline scripts').toBeGreaterThan(0);
    expect(missing, `inline scripts with no CSP hash:\n${missing.join('\n')}`).toEqual([]);
  });

  test('the policy does not fall back to unsafe-inline scripts', async () => {
    const headers = await readFile(join(OUT, '_headers'), 'utf8');
    const csp = headers
      .split('\n')
      .find((line) => line.trim().startsWith('Content-Security-Policy:'));

    expect(csp).toBeTruthy();
    const scriptSrc = /script-src([^;]*)/.exec(csp!)?.[1] ?? '';
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).toContain("'sha256-");
  });

  test('security headers are present', async () => {
    const headers = await readFile(join(OUT, '_headers'), 'utf8');
    for (const header of [
      'X-Content-Type-Options: nosniff',
      'Referrer-Policy: strict-origin-when-cross-origin',
      'X-Frame-Options: DENY',
      'Strict-Transport-Security:',
      'Cache-Control: public, max-age=31536000, immutable',
    ]) {
      expect(headers).toContain(header);
    }
  });
});
