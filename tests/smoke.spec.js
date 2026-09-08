import { test, expect } from '@playwright/test';

const feedUrl = 'https://example.com/feed.rss';

const htmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Feed de ejemplo</title>
    <link>${feedUrl}</link>
    <description>Descripción del feed</description>
    <item>
      <title>Post con HTML</title>
      <link>https://example.com/post</link>
      <description><![CDATA[<p>Article URL: <a href="https://example.com/article">mi artículo</a></p><p>Points: 7</p>]]></description>
    </item>
  </channel>
</rss>`;

const proxyResponse = JSON.stringify({ contents: htmlFeed, status: { http_code: 200 } });

test('app loads and shows the form', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'RSS Reader' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'url' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Añadir' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Feeds' })).toBeVisible();
});

test('renders post description as sanitized html in the modal', async ({ page }) => {
  await page.route('**/get?**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: proxyResponse });
  });

  await page.goto('/');
  await page.fill('#url', feedUrl);
  await page.click('button[type="submit"]');

  const postTitle = page.locator('.posts').getByRole('link', { name: 'Post con HTML' });
  await expect(postTitle).toBeVisible();

  await page.locator('.posts').getByRole('button', { name: /Vista previa/ }).click();

  const modalBody = page.locator('#modal-body');
  await expect(modalBody).toBeVisible();
  await expect(modalBody.getByRole('link', { name: 'mi artículo' })).toBeVisible();
  await expect(modalBody).toContainText('Points: 7');
  await expect(modalBody).not.toContainText('<p>');
});