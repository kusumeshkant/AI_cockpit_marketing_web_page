import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/** Collects console errors so every test can assert a clean console. */
function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test('hero copy and CTAs render, console is clean', async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto('/');

  await expect(page).toHaveTitle(/AI Cockpit/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your AI agents work.');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('You stay the pilot.');

  // The hero CTA is visible without waiting for any 3D chunk.
  await expect(page.locator('#top [data-cta="request-demo"]')).toBeVisible();

  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
});

test('every demo CTA targets the on-site form', async ({ page }) => {
  await page.goto('/');
  const ctas = page.locator('[data-cta="request-demo"]');
  const count = await ctas.count();
  expect(count).toBeGreaterThanOrEqual(4);

  // Real anchors to the form section, so they work before hydration replaces
  // the behaviour with the dialog.
  for (let i = 0; i < count; i += 1) {
    await expect(ctas.nth(i)).toHaveAttribute('href', '#request-demo');
  }
});

test('all 13 sections are present', async ({ page }) => {
  await page.goto('/');

  for (const id of ['top', 'how-it-works', 'use-cases', 'consultants', 'security', 'pricing']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  const headings = [
    'Your agents are fast. Your approvals are scattered.',
    'From agent to approval in three steps.',
    'Review it. Fix it. Ship it. In five seconds.',
    'If a mistake would cost you, put a pilot on it.',
    'Close more automation deals. Give clients the brake pedal.',
    'Built like flight software.',
    'Simple plans. Cancel anytime.',
    'Questions pilots ask.',
    'Put a pilot in every AI workflow.',
  ];
  for (const heading of headings) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }

  await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('demo modal opens and closes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Watch 60-sec demo' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('60-second demo');

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('FAQ accordion toggles', async ({ page }) => {
  await page.goto('/');

  const first = page.locator('details', { hasText: 'Why not just approve in Slack' });
  const second = page.locator('details', { hasText: 'Do I have to change my agent?' });

  await expect(first).toHaveAttribute('open', '');
  await expect(second).not.toHaveAttribute('open', '');

  const summary = second.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400); // let smooth scrolling settle
  await summary.click();

  await expect(second).toHaveAttribute('open', '');
  // The shared `name` attribute makes the group exclusive.
  await expect(first).not.toHaveAttribute('open', '');
});

test('no horizontal overflow at any target width', async ({ page }) => {
  await page.goto('/');

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test('no WebGL canvas is created on mobile or under reduced motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'desktop is allowed to render the 3D layer');

  await page.goto('/');
  await page.waitForTimeout(1200);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('no animation or 3D code is referenced by the initial HTML', async ({ page, baseURL }) => {
  const html = await (await page.request.get(`${baseURL}/`)).text();

  // Every script the document loads up front, minus the legacy noModule bundle.
  const scripts = [...html.matchAll(/<script src="(\/_next\/[^"]+\.js)"([^>]*)>/g)]
    .filter(([, , attrs]) => !attrs.includes('noModule'))
    .map(([, src]) => src);
  const preloads = [...html.matchAll(/<link rel="[a-z]*preload" href="(\/_next\/[^"]+\.js)"/g)].map(
    ([, href]) => href,
  );

  expect(scripts.length).toBeGreaterThan(0);

  const offenders: string[] = [];
  for (const src of [...new Set([...scripts, ...preloads])]) {
    const body = await (await page.request.get(`${baseURL}${src}`)).text();
    if (/motionValue|WebGLRenderer/.test(body)) offenders.push(src);
  }

  expect(
    offenders,
    `Framer Motion / three.js must stay in lazy chunks, found in: ${offenders.join(', ')}`,
  ).toEqual([]);
});

test('the scroll scenes do load their animation chunk on demand', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'scroll scenes only animate on desktop');

  const chunks: string[] = [];
  page.on('response', async (res) => {
    if (!res.url().endsWith('.js')) return;
    try {
      const body = await res.text();
      if (/motionValue/.test(body)) chunks.push(res.url());
    } catch {
      // response body already discarded — ignore
    }
  });

  await page.goto('/');
  await page
    .getByRole('heading', { name: 'From agent to approval in three steps.' })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  expect(chunks.length, 'expected the Framer Motion chunk to load once scrolled').toBeGreaterThan(
    0,
  );
});
