import { expect, test } from '@playwright/test';

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
