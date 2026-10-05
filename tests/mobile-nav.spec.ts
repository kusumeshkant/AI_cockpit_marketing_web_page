import { expect, test, type Page } from '@playwright/test';

/** The page background, `--color-bg` (#070d13), fully opaque. */
const OPAQUE_BG = 'rgb(7, 13, 19)';

const PHONES = [
  { name: 'iphone', width: 390, height: 844 },
  { name: 'android', width: 412, height: 915 },
] as const;

const toggle = (page: Page) => page.getByRole('button', { name: /open menu|close menu/i });
const sheet = (page: Page) => page.locator('#mobile-menu');

/**
 * Samples a grid of points below the header and returns any whose topmost
 * element is not part of the sheet — i.e. page content showing through.
 */
async function leaksBehindSheet(page: Page) {
  return page.evaluate(() => {
    const panel = document.getElementById('mobile-menu');
    const header = document.getElementById('mobile-menu')?.previousElementSibling;
    if (!panel || !header) return ['sheet or header missing'];
    const top = header.getBoundingClientRect().bottom;
    const leaks: string[] = [];
    for (let x = 2; x < innerWidth; x += Math.floor(innerWidth / 8)) {
      for (let y = top + 2; y < innerHeight; y += Math.floor((innerHeight - top) / 12)) {
        const el = document.elementFromPoint(x, y);
        if (!el || !panel.contains(el)) {
          leaks.push(`${x},${Math.round(y)} → ${el?.tagName ?? 'nothing'}.${el?.className ?? ''}`);
        }
      }
    }
    return leaks;
  });
}

async function openSheet(page: Page) {
  await toggle(page).click();
  await expect(sheet(page)).toBeVisible();
  // Let the 200ms fade settle before measuring or capturing.
  await expect(sheet(page)).toHaveCSS('opacity', '1');
}

for (const phone of PHONES) {
  test.describe(`mobile menu at ${phone.width}x${phone.height}`, () => {
    test.use({
      viewport: { width: phone.width, height: phone.height },
      isMobile: true,
      hasTouch: true,
    });

    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name === 'desktop', 'covered by the phone viewports below');
    });

    for (const position of ['top', 'mid-page'] as const) {
      test(`covers the page completely when opened at the ${position}`, async ({
        page,
      }, testInfo) => {
        await page.goto('/');
        if (position === 'mid-page') {
          await page.locator('#use-cases').scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          expect(await page.evaluate(() => scrollY)).toBeGreaterThan(phone.height);
        }

        await openSheet(page);

        const box = await sheet(page).boundingBox();
        const headerBox = await page.getByRole('banner').boundingBox();
        expect(box, 'sheet box').not.toBeNull();
        expect(headerBox, 'header box').not.toBeNull();
        expect(box!.x).toBe(0);
        expect(box!.width).toBe(phone.width);
        // Flush under the bar: no gap for page content to show through.
        expect(box!.y).toBeLessThanOrEqual(headerBox!.y + headerBox!.height);
        expect(box!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
        expect(box!.y + box!.height).toBeCloseTo(phone.height, 0);

        await expect(sheet(page)).toHaveCSS('background-color', OPAQUE_BG);
        await expect(page.getByRole('banner')).toHaveCSS('background-color', OPAQUE_BG);
        expect(await leaksBehindSheet(page)).toEqual([]);

        // The CTA sits below the last link, not on top of it.
        const lastLink = await sheet(page)
          .getByRole('link')
          .filter({ hasText: 'Pricing' })
          .boundingBox();
        const cta = await sheet(page).locator('[data-cta="request-demo"]').boundingBox();
        expect(cta!.y).toBeGreaterThan(lastLink!.y + lastLink!.height);
        expect(cta!.y + cta!.height).toBeLessThanOrEqual(phone.height);

        await page.screenshot({
          path: testInfo.outputPath(`menu-${phone.name}-${position}.png`),
        });
      });
    }

    test('is an accessible disclosure', async ({ page }) => {
      await page.goto('/');
      await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle(page)).toHaveAttribute('aria-controls', 'mobile-menu');
      await expect(sheet(page)).toBeHidden();
      // Closed, the sheet's links are out of the tab order and the a11y tree.
      expect(await sheet(page).evaluate((el) => (el as HTMLElement).inert)).toBe(true);
      await expect(page.getByRole('navigation', { name: 'Mobile' })).toHaveCount(0);

      await openSheet(page);
      await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
      expect(await sheet(page).evaluate((el) => (el as HTMLElement).inert)).toBe(false);

      // A disclosure, not a modal dialog: the labelled <nav> is the landmark.
      await expect(sheet(page)).not.toHaveAttribute('role', /.*/);
      await expect(sheet(page)).not.toHaveAttribute('aria-modal', /.*/);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const menuNav = sheet(page).getByRole('navigation', { name: 'Mobile' });
      await expect(menuNav).toBeVisible();

      // Every link is a comfortable tap target.
      for (const link of await menuNav.getByRole('link').all()) {
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
      }

      // The page behind is locked.
      expect(
        await page.evaluate(() => [
          getComputedStyle(document.documentElement).overflow,
          getComputedStyle(document.body).overflow,
        ]),
      ).toEqual(['hidden', 'hidden']);

      // Focus stays within the toggle and the sheet.
      for (let i = 0; i < 10; i += 1) {
        await page.keyboard.press('Tab');
        const inside = await page.evaluate(
          () =>
            document.getElementById('mobile-menu')!.contains(document.activeElement) ||
            document.activeElement?.getAttribute('aria-controls') === 'mobile-menu',
        );
        expect(inside, `focus escaped after ${i + 1} tabs`).toBe(true);
      }

      await page.keyboard.press('Escape');
      await expect(sheet(page)).toBeHidden();
      await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle(page)).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    });

    test('tapping a link closes the sheet and scrolls to its section', async ({ page }) => {
      await page.goto('/');
      await openSheet(page);
      await sheet(page).getByRole('link', { name: 'Security' }).tap();

      await expect(sheet(page)).toBeHidden();
      await expect(page).toHaveURL(/#security$/);
      await expect
        .poll(
          () =>
            page.evaluate(() => document.getElementById('security')!.getBoundingClientRect().top),
          {
            timeout: 3000,
          },
        )
        .toBeLessThan(120);
    });

    test('the sheet CTA closes the sheet and opens the inquiry dialog', async ({ page }) => {
      await page.goto('/');
      await openSheet(page);
      await sheet(page).locator('[data-cta="request-demo"]').tap();

      await expect(sheet(page)).toBeHidden();
      await expect(page.getByRole('dialog', { name: /demo/i })).toBeVisible();
    });

    test('closes when the viewport grows to desktop', async ({ page }) => {
      await page.goto('/');
      await openSheet(page);
      await page.setViewportSize({ width: 1280, height: 900 });

      await expect(sheet(page)).toBeHidden();
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    });
  });
}

test('desktop nav is unchanged', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop layout only');
  await page.goto('/');

  const primary = page.getByRole('navigation', { name: 'Primary' });
  await expect(primary).toBeVisible();
  await expect(primary.getByRole('link')).toHaveText([
    'How it works',
    'Use cases',
    'For consultants',
    'Security',
    'Pricing',
  ]);
  await expect(page.locator('header [data-cta="request-demo"]')).toBeVisible();
  await expect(toggle(page)).toBeHidden();
  await expect(sheet(page)).toBeHidden();

  await page.screenshot({ path: testInfo.outputPath('desktop-nav.png') });
});
