import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { LEGAL_PATHS } from '../src/content/legal';

// The Play Console listing links to these three pages; they must load without
// JavaScript errors and keep the facts Play reviewers check.
const pages = [
  { path: '/privacy', h1: 'Privacy Policy', mustContain: ['Supabase', 'Sentry', 'Delete account'] },
  { path: '/terms', h1: 'Terms of Service', mustContain: ['Bengaluru', 'laws of India'] },
  {
    path: '/delete-account',
    h1: 'Delete your AI Cockpit account',
    mustContain: ['Delete my account', 'within 30 days', 'What is kept'],
  },
] as const;

for (const { path, h1, mustContain } of pages) {
  test(`${path} renders its content`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: h1 })).toBeVisible();
    await expect(page.getByText('Last updated 30 October 2026')).toBeVisible();
    await expect(page.getByText('kusumeshkantsharma@gmail.com').first()).toBeVisible();
    for (const text of mustContain) {
      await expect(page.getByText(text).first()).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test('footer links to the legal pages', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  await expect(footer.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  await expect(footer.getByRole('link', { name: 'Delete account' })).toHaveAttribute(
    'href',
    '/delete-account',
  );
});

// Play Console links to the legal pages, so they must stay crawlable even on
// noindex (staging) builds. These read the built output in out/.
test.describe('legal pages stay crawlable', () => {
  const noindex = process.env.NEXT_PUBLIC_NOINDEX === 'true';
  const out = (file: string) => readFile(join(process.cwd(), 'out', file), 'utf8');

  test('scripts/headers.mjs lists the same pages as LEGAL_PATHS', async () => {
    const script = await readFile(join(process.cwd(), 'scripts', 'headers.mjs'), 'utf8');
    const listed = /const LEGAL_PATHS = \[([^\]]*)\]/.exec(script)?.[1] ?? '';
    expect(listed.match(/'[^']+'/g)?.map((path) => path.slice(1, -1))).toEqual([...LEGAL_PATHS]);
  });

  test('robots.txt allows them', async () => {
    const robots = await out('robots.txt');
    if (noindex) {
      expect(robots).toMatch(/^Disallow: \/$/m);
      for (const path of LEGAL_PATHS) expect(robots).toMatch(new RegExp(`^Allow: ${path}$`, 'm'));
    } else {
      expect(robots).toMatch(/^Allow: \/$/m);
      expect(robots).not.toMatch(/^Disallow:/m);
    }
  });

  test('_headers removes X-Robots-Tag from them on noindex builds', async () => {
    const headers = (await out('_headers')).replace(/\r\n/g, '\n');
    for (const path of LEGAL_PATHS) {
      for (const rule of [path, `${path}/`, `${path}/*`]) {
        const block = new RegExp(`^${rule.replace('*', '\*')}\n  ! X-Robots-Tag$`, 'm');
        if (noindex) expect(headers).toMatch(block);
        else expect(headers).not.toMatch(block);
      }
    }
  });

  test('their HTML says index, follow while the home page follows the build', async () => {
    for (const path of LEGAL_PATHS) {
      const html = await out(`${path.slice(1)}/index.html`);
      expect(html).toContain('<meta name="robots" content="index, follow"/>');
    }
    const home = await out('index.html');
    expect(home).toContain(
      `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}"/>`,
    );
  });
});
