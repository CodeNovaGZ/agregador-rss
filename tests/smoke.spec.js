import { test, expect } from '@playwright/test';

const feedUrl = 'https://example.com/feed.rss';

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
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

const rdfFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/">
  <channel rdf:about="${feedUrl}">
    <title>Feed RDF</title>
    <description>Descripción RDF</description>
  </channel>
  <item rdf:about="https://example.com/rdf-post">
    <title>Post RDF</title>
    <description>Resumen RDF</description>
  </item>
</rdf:RDF>`;

const feedWithoutDescription = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Feed sin descripción</title>
    <item>
      <link>https://example.com/sin-titulo</link>
    </item>
  </channel>
</rss>`;

const feedWithoutTitles = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <link>https://example.com/only-link</link>
    </item>
  </channel>
</rss>`;

const notAFeed = '<html><body>Not a feed</body></html>';

const proxyBody = (contents) => JSON.stringify({ contents, status: { http_code: 200 } });

const mockFeed = (page, contents) => page.route('**/get?**', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: proxyBody(contents),
  });
});

const submit = async (page, url) => {
  await page.locator('input[aria-label="url"]').fill(url);
  await page.click('button[type="submit"]');
};

test('app loads and shows the form', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'RSS Reader' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'url' })).toBeVisible();
  await expect(page.locator('input[aria-label="url"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Añadir' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Feeds' })).toBeVisible();
});

test('sets the document title and language from the translations', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('RSS Reader');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('turns off autofill and renders the example link from the translations', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('textbox', { name: 'url' })).toHaveAttribute('autocomplete', 'off');

  const example = page.getByRole('link', { name: 'https://hnrss.org/frontpage' });
  await expect(example).toBeVisible();
  await expect(example).toHaveAttribute('href', 'https://hnrss.org/frontpage');
});

test('disables the form controls while the feed is loading', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });

  await page.route('**/get?**', async (route) => {
    await pending;
    await route.fulfill({ status: 200, contentType: 'application/json', body: proxyBody(rssFeed) });
  });

  await page.goto('/');
  await submit(page, feedUrl);

  await expect(page.getByRole('button', { name: 'Cargando…' })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'url' })).toBeDisabled();

  release();

  await expect(page.getByRole('button', { name: 'Añadir' })).toBeEnabled();
  await expect(page.getByRole('textbox', { name: 'url' })).toBeEnabled();
  await expect(page.locator('.posts').getByRole('link', { name: 'Post con HTML' })).toBeVisible();
});

test('reports a required error when the url is empty', async ({ page }) => {
  await page.goto('/');
  await page.click('button[type="submit"]');

  await expect(page.locator('#rssFeedback')).toHaveText('No puede estar vacío');
});

test('reports a url error when the url is not valid', async ({ page }) => {
  await page.goto('/');
  await submit(page, 'no soy una url');

  await expect(page.locator('#rssFeedback')).toHaveText('Debes ingresar una URL válida');
});

test('reports a parse error when the response is not a feed', async ({ page }) => {
  await mockFeed(page, notAFeed);
  await page.goto('/');
  await submit(page, feedUrl);

  await expect(page.locator('#rssFeedback')).toHaveText('El recurso no contiene un RSS valido');
  await expect(page.locator('#feeds')).toBeEmpty();
});

test('reports a network error when the proxy request fails', async ({ page }) => {
  await page.route('**/get?**', (route) => route.abort('failed'));
  await page.goto('/');
  await submit(page, feedUrl);

  await expect(page.locator('#rssFeedback')).toHaveText('Error de red');
});

test('reports a duplicate error when the feed was already added', async ({ page }) => {
  await mockFeed(page, rssFeed);
  await page.goto('/');
  await submit(page, feedUrl);

  await expect(page.locator('#rssFeedback')).toHaveText('El RSS se cargó correctamente');

  await page.click('button[type="submit"]');

  await expect(page.locator('#rssFeedback')).toHaveText('El RSS ya existe');
  await expect(page.locator('#feeds article')).toHaveCount(1);
});

test('adds a feed that has no description and no post titles', async ({ page }) => {
  await mockFeed(page, feedWithoutDescription);
  await page.goto('/');
  await submit(page, feedUrl);

  await expect(page.locator('#rssFeedback')).toHaveText('El RSS se cargó correctamente');
  await expect(page.locator('#feeds')).toContainText('Feed sin descripción');
  await expect(page.locator('#feeds')).not.toContainText('null');

  const post = page.locator('.posts').getByRole('link', { name: 'https://example.com/sin-titulo' });
  await expect(post).toBeVisible();
  await expect(post).toHaveAttribute('href', 'https://example.com/sin-titulo');
});

test('falls back to the url when a feed and its posts have no titles', async ({ page }) => {
  await mockFeed(page, feedWithoutTitles);
  await page.goto('/');
  await submit(page, feedUrl);

  await expect(page.locator('#rssFeedback')).toHaveText('El RSS se cargó correctamente');
  await expect(page.locator('#feeds')).toContainText(feedUrl);
  await expect(page.locator('#feeds')).not.toContainText('null');
  await expect(page.locator('.posts').getByRole('link', { name: 'https://example.com/only-link' })).toBeVisible();
});

test('parses rss 1.0 rdf items that are siblings of the channel', async ({ page }) => {
  await mockFeed(page, rdfFeed);
  await page.goto('/');
  await submit(page, feedUrl);

  await expect(page.locator('#rssFeedback')).toHaveText('El RSS se cargó correctamente');
  await expect(page.locator('#feeds')).toContainText('Feed RDF');

  const post = page.locator('.posts').getByRole('link', { name: 'Post RDF' });
  await expect(post).toBeVisible();
  await expect(post).toHaveAttribute('href', 'https://example.com/rdf-post');
});

test('renders post description as sanitized html in the modal', async ({ page }) => {
  await mockFeed(page, rssFeed);

  await page.goto('/');
  await submit(page, feedUrl);

  const postTitle = page.locator('.posts').getByRole('link', { name: 'Post con HTML' });
  await expect(postTitle).toBeVisible();

  await page.locator('.posts').getByRole('button', { name: /Vista previa/ }).click();

  const modalBody = page.locator('#modal-body');
  await expect(modalBody).toBeVisible();
  await expect(modalBody.getByRole('link', { name: 'mi artículo' })).toBeVisible();
  await expect(modalBody).toContainText('Points: 7');
  await expect(modalBody).not.toContainText('<p>');
});
