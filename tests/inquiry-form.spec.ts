import { expect, test, type Page } from '@playwright/test';

/**
 * The inquiry form in the browser, with `/api/inquiry` intercepted — these
 * assert the UI contract, not the endpoint (see `inquiry-api.spec.ts`).
 */

/** Fills the minimum required fields inside whichever form is on screen. */
async function fillRequired(page: Page, scope = page.locator('form')) {
  await scope.getByLabel('Full name').fill('Asha Menon');
  await scope.getByLabel('Phone / WhatsApp').fill('+91 98765 43210');
  await scope.getByRole('checkbox').check();
}

async function openModal(page: Page) {
  await page.locator('[data-cta="request-demo"]:visible').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  return page.getByRole('dialog');
}

test('every CTA opens the dialog', async ({ page }) => {
  await page.goto('/');

  const ctas = page.locator('[data-cta="request-demo"]:visible');
  const count = await ctas.count();
  expect(count).toBeGreaterThanOrEqual(3);

  for (let i = 0; i < count; i += 1) {
    await ctas.nth(i).scrollIntoViewIfNeeded();
    await ctas.nth(i).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
});

test('Escape closes the dialog and focus returns to the opener', async ({ page }) => {
  await page.goto('/');

  const trigger = page.locator('[data-cta="request-demo"]:visible').first();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Tab stays inside the dialog', async ({ page }) => {
  await page.goto('/');
  const dialog = await openModal(page);

  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(inside, `focus escaped the dialog after ${i + 1} tabs`).toBe(true);
  }
});

test('required fields report errors and nothing is submitted', async ({ page }) => {
  let posted = false;
  await page.route('**/api/inquiry', async (route) => {
    posted = true;
    await route.fulfill({ status: 200, body: '{"ok":true}' });
  });

  await page.goto('/');
  const dialog = await openModal(page);
  await dialog.getByRole('button', { name: 'Request a demo' }).click();

  await expect(dialog.getByText('Please tell us your name.')).toBeVisible();
  await expect(dialog.getByText('Please add a phone or WhatsApp number.')).toBeVisible();
  await expect(dialog.getByText('Please agree to be contacted so we can reply.')).toBeVisible();
  expect(posted).toBe(false);
});

test('phone validation rejects a too-short number', async ({ page }) => {
  await page.goto('/');
  const dialog = await openModal(page);

  await dialog.getByLabel('Full name').fill('Asha Menon');
  await dialog.getByLabel('Phone / WhatsApp').fill('12345');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Request a demo' }).click();

  await expect(dialog.getByText('That does not look like a phone number.')).toBeVisible();
});

test('a successful submit shows the first name back', async ({ page }) => {
  await page.route('**/api/inquiry', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );

  await page.goto('/');
  const dialog = await openModal(page);
  await fillRequired(page, dialog);
  await dialog.getByRole('button', { name: 'Request a demo' }).click();

  await expect(dialog.getByText(/Thanks, Asha/)).toBeVisible();
  // We phone people; we never email them, so the copy must not promise an inbox.
  await expect(dialog.getByText(/contact you on the number you shared/)).toBeVisible();
  await expect(dialog.getByText(/inbox/i)).toHaveCount(0);
});

test('an error keeps the typed values so nothing is retyped', async ({ page }) => {
  await page.route('**/api/inquiry', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' }),
  );

  await page.goto('/');
  const dialog = await openModal(page);
  await fillRequired(page, dialog);
  await dialog.getByLabel('Company / agency').fill('Northwind');
  await dialog.getByRole('button', { name: 'Request a demo' }).click();

  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel('Full name')).toHaveValue('Asha Menon');
  await expect(dialog.getByLabel('Company / agency')).toHaveValue('Northwind');
});

test('a rate-limited response is explained', async ({ page }) => {
  await page.route('**/api/inquiry', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: '{"ok":false,"error":"rate_limited"}',
    }),
  );

  await page.goto('/');
  const dialog = await openModal(page);
  await fillRequired(page, dialog);
  await dialog.getByRole('button', { name: 'Request a demo' }).click();

  await expect(dialog.getByRole('alert')).toContainText(/lot of requests/i);
});

test('the honeypot is present, off-screen and hidden from assistive tech', async ({ page }) => {
  await page.goto('/');
  const dialog = await openModal(page);

  const honeypot = dialog.locator('input[name="website"]');
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).toHaveAttribute('tabindex', '-1');
  // A real user can neither see nor reach it.
  await expect(honeypot).not.toBeInViewport();
  const hiddenFromAt = await honeypot.evaluate((el) => !!el.closest('[aria-hidden="true"]'));
  expect(hiddenFromAt).toBe(true);
});

test('the request-demo section exists as a CTA target', async ({ page }) => {
  await page.goto('/');

  const section = page.locator('#request-demo');
  await expect(section).toHaveCount(1);
  await expect(section.getByRole('heading', { name: 'Request a demo' })).toBeVisible();

  // The CTAs are real links to it, so they work before hydration.
  await expect(page.locator('[data-cta="request-demo"]').first()).toHaveAttribute(
    'href',
    '#request-demo',
  );

  // Scrolling there loads the form.
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByLabel('Full name')).toBeVisible({ timeout: 10_000 });
});

test('the section explains that the form needs JavaScript', async ({ page }) => {
  const html = await (await page.request.get('/')).text();
  expect(html).toContain('<noscript>');
  expect(html).toMatch(/needs JavaScript/i);
});

test('the privacy page is reachable from the consent checkbox', async ({ page }) => {
  await page.goto('/');
  const dialog = await openModal(page);

  await expect(dialog.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');

  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
  await expect(page.getByText(/Draft — review before public launch/)).toBeVisible();
});
