import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import baseline from '../../content/catalog/baseline.json';
import { parseCatalog, type Catalog } from '../../src/features/catalog/data';

const model = baseline.models.find((item) => item.name === 'mimo-v2.5')!;
const recipe = model.variants.find(
  (item) => item.id === 'sglang-tp8-h100-optimized',
)!;
const yaml = readFileSync('tests/fixtures/catalog/mimo.yaml', 'utf8');
const modelTitle = model.displayName?.trim() || model.name;
const shortHref = `/model?id=${model.name}`;

async function mockSources(
  page: Page,
  catalog: Catalog = parseCatalog(baseline),
) {
  await page.route(
    'https://modelsphere.github.io/model-catalog/**',
    (route) => {
      if (route.request().url().endsWith('index-v2.json'))
        return route.fulfill({ json: catalog });
      if (route.request().url().endsWith('.history.json'))
        return route.fulfill({
          json: {
            model: model.name,
            id: recipe.id,
            path: recipe.path,
            revisions: [],
          },
        });
      return route.abort();
    },
  );
  await page.route(
    'https://raw.githubusercontent.com/modelsphere/model-catalog/**',
    (route) =>
      route.request().url().endsWith('.yaml')
        ? route.fulfill({ body: yaml, contentType: 'text/plain' })
        : route.abort(),
  );
}

async function openCatalog(page: Page, query: string) {
  await page.goto('/models?' + query);
  await expect(page.locator('[data-catalog-enhanced="true"]')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute(
    'data-catalog-status',
    'live',
  );
}

const catalogReturnLink = (page: Page) =>
  page
    .getByRole('navigation', { name: '面包屑', exact: true })
    .getByRole('link', { name: '模型与调优', exact: true });

test.beforeEach(async ({ page }) => mockSources(page));

for (const view of ['models', 'recipes'])
  for (const layout of ['cards', 'table'])
    test(`model links use compact URLs in ${view} ${layout} results`, async ({
      page,
    }) => {
      await openCatalog(page, `q=${model.name}&view=${view}&layout=${layout}`);
      const title = page
        .locator('main')
        .getByRole('link', { name: modelTitle, exact: true })
        .first();
      await expect(title).toHaveAttribute('href', shortHref);
      await title.click();
      await expect(page).toHaveURL(shortHref);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        modelTitle,
      );
    });

test('legacy model URLs replace their history entry and retain explicit snapshots', async ({
  page,
}) => {
  const catalog = `/models?q=${model.name}&layout=table&sort=name-asc`;
  await page.goto(catalog);
  const legacy = new URLSearchParams({
    modelId: model.name,
    dataVersion: baseline.commit,
    returnTo: catalog,
  });
  await page.goto('/models/detail?' + legacy);
  await expect(page).toHaveURL((url) => {
    return (
      url.pathname === '/model' &&
      url.searchParams.get('id') === model.name &&
      url.searchParams.get('dataVersion') === baseline.commit &&
      !url.searchParams.has('modelId') &&
      !url.searchParams.has('returnTo')
    );
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);
  await expect(catalogReturnLink(page)).toHaveAttribute('href', catalog);
  await page.reload();
  await expect(catalogReturnLink(page)).toHaveAttribute('href', catalog);
  await page.goBack();
  await expect(page).toHaveURL(catalog);
});

test('catalog return context survives model refresh, history navigation and recipe navigation', async ({
  page,
}) => {
  const query = `q=${model.name}&layout=table&sort=name-asc`;
  const catalog = '/models?' + query;
  await openCatalog(page, query);
  await page
    .locator('main')
    .getByRole('link', { name: modelTitle, exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(shortHref);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);
  await expect(catalogReturnLink(page)).toHaveAttribute('href', catalog);
  await page.goBack();
  await expect(page).toHaveURL(catalog);
  await page.goForward();
  await expect(page).toHaveURL(shortHref);
  await expect(catalogReturnLink(page)).toHaveAttribute('href', catalog);
  await page
    .getByRole('heading', { level: 3 })
    .getByRole('link', { name: recipe.id, exact: true })
    .click();
  await expect(page.getByRole('tab', { name: '部署配置' })).toBeVisible();
  await page.getByRole('link', { name: '返回模型与调优', exact: true }).click();
  await expect(page).toHaveURL(catalog);
  await expect(
    page.getByRole('textbox', { name: '搜索模型与调优', exact: true }),
  ).toHaveValue(model.name);
});

test('a fresh short link uses the current catalog while an existing entry retains its snapshot', async ({
  page,
  context,
}) => {
  await openCatalog(page, `q=${model.name}`);
  await page
    .locator('main')
    .getByRole('link', { name: modelTitle, exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(shortHref);

  const latest = parseCatalog(structuredClone(baseline));
  latest.commit = 'b'.repeat(40);
  latest.models.find((item) => item.name === model.name)!.displayName =
    'Updated live model';
  await page.route('**/index-v2.json', (route) =>
    route.fulfill({ json: latest }),
  );
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);

  const fresh = await context.newPage();
  await mockSources(fresh, latest);
  await fresh.goto(shortHref);
  await expect(fresh.getByRole('heading', { level: 1 })).toHaveText(
    'Updated live model',
  );
  await expect(catalogReturnLink(fresh)).toHaveAttribute('href', '/models');
  await fresh.close();
});

test('runtime-only models resolve through the static short entry without a new page build', async ({
  page,
}) => {
  const live = parseCatalog(structuredClone(baseline));
  live.commit = 'b'.repeat(40);
  live.models.push({
    ...live.models[0],
    name: 'runtime-only-model',
    displayName: 'Runtime-only model',
    variants: [],
    tuning: [],
    reports: [],
    defaultVariant: undefined,
  });
  live.count = live.models.length;
  await page.route('**/index-v2.json', (route) =>
    route.fulfill({ json: live }),
  );
  const response = await page.goto('/model?id=runtime-only-model');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Runtime-only model',
  );
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Runtime-only model',
  );
});

test('English model links and canonical URLs retain the locale and omit navigation context', async ({
  page,
}) => {
  await page.goto(`/en/models?q=${model.name}`);
  await expect(page.locator('[data-catalog-enhanced="true"]')).toBeVisible();
  const title = page
    .locator('main')
    .getByRole('link', { name: modelTitle, exact: true })
    .first();
  await expect(title).toHaveAttribute('href', '/en' + shortHref);
  await title.click();
  await expect(page).toHaveURL('/en' + shortHref);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  const url = new URL((await canonical.getAttribute('href'))!);
  expect(url.pathname + url.search).toBe('/en' + shortHref);
  expect(
    await page
      .locator('meta[name="robots"]')
      .evaluateAll((elements) =>
        elements.every((element) =>
          element.getAttribute('content')?.includes('noindex'),
        ),
      ),
  ).toBe(true);
  await page.reload();
  await expect(page).toHaveURL('/en' + shortHref);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);
});

test('switching model language preserves the catalog snapshot and filtered return path after refresh', async ({
  page,
}) => {
  const query = `q=${model.name}&layout=table&sort=name-asc`;
  const catalog = '/models?' + query;
  await openCatalog(page, query);
  await page
    .locator('main')
    .getByRole('link', { name: modelTitle, exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(shortHref);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);
  await expect(
    page.locator('.desktop-nav a[aria-current="page"]'),
  ).toHaveAttribute('href', '/models');

  const latest = parseCatalog(structuredClone(baseline));
  latest.commit = 'b'.repeat(40);
  latest.models.find((item) => item.name === model.name)!.displayName =
    'Updated live model';
  await page.route('**/index-v2.json', (route) =>
    route.fulfill({ json: latest }),
  );
  await page.getByRole('combobox', { name: '切换语言', exact: true }).click();
  await page.getByRole('option', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('/en' + shortHref);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);
  await expect(
    page.locator('.desktop-nav a[aria-current="page"]'),
  ).toHaveAttribute('href', '/en/models');

  await page.reload();
  await expect(page).toHaveURL('/en' + shortHref);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(modelTitle);
  const returnLink = page.locator('main nav').first().getByRole('link').first();
  await expect(returnLink).toHaveAttribute('href', '/en' + catalog);
  await returnLink.click();
  await expect(page).toHaveURL('/en' + catalog);
  await expect(page.locator('main').getByRole('textbox').first()).toHaveValue(
    model.name,
  );
});

test('explicit unavailable snapshots remain errors instead of silently opening the latest model', async ({
  page,
}) => {
  const snapshot = 'a'.repeat(40);
  await page.goto(shortHref + '&dataVersion=' + snapshot);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '目录版本不可用',
  );
  expect(new URL(page.url()).searchParams.get('dataVersion')).toBe(snapshot);
  await page.goto(
    `/models/detail?modelId=${model.name}&dataVersion=${snapshot}`,
  );
  await expect(page).toHaveURL(shortHref + '&dataVersion=' + snapshot);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '目录版本不可用',
  );
});

test('missing identifiers and unsafe legacy return URLs retain safe fallback behavior', async ({
  page,
}) => {
  await page.goto('/models/detail');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '详情参数不完整',
  );
  await page.goto('/model');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '详情参数不完整',
  );
  await page.goto(
    `/models/detail?modelId=${model.name}&returnTo=https%3A%2F%2Fevil.test%2Fmodels`,
  );
  await expect(page).toHaveURL(shortHref);
  await expect(catalogReturnLink(page)).toHaveAttribute('href', '/models');
});
