import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import baseline from '../../content/catalog/baseline.json';

const model = baseline.models.find((item) => item.name === 'mimo-v2.5')!;
const recipe = model.variants.find(
  (item) => item.id === 'sglang-tp8-h100-optimized',
)!;
const title = model.displayName!;
const href = `/recipe?model=${model.name}&id=${recipe.id}`;
const catalog = `/models?q=${model.name}&layout=table`;
const yaml = readFileSync('tests/fixtures/catalog/mimo.yaml', 'utf8');

test.beforeEach(async ({ page }) => {
  await page.route(
    'https://modelsphere.github.io/model-catalog/**',
    (route) => {
      if (route.request().url().endsWith('index-v2.json'))
        return route.fulfill({ json: baseline });
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
});

test('legacy recipe links shorten and keep filters through refresh and tab changes', async ({
  page,
}) => {
  const params = new URLSearchParams({
    modelId: model.name,
    recipeId: recipe.id,
    dataVersion: baseline.commit,
    returnTo: catalog,
  });
  await page.goto('/models/recipe?' + params);
  await expect(page).toHaveURL(href);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  const returnLink = page.getByRole('link', {
    name: '返回模型与调优',
    exact: true,
  });
  await expect(returnLink).toHaveAttribute('href', catalog);
  await page.reload();
  await expect(returnLink).toHaveAttribute('href', catalog);
  await page.getByRole('tab', { name: '性能对照', exact: true }).click();
  await expect(page).toHaveURL(href + '&tab=performance');
  await expect(returnLink).toHaveAttribute('href', catalog);
  await page.getByRole('tab', { name: '部署配置', exact: true }).click();
  await expect(page).toHaveURL(href);
  await page.reload();
  await returnLink.click();
  await expect(page).toHaveURL(catalog);
});

test('catalog recipe clicks carry filters while copied short links open independently', async ({
  page,
  context,
}) => {
  await page.goto(catalog);
  await expect(page.locator('main')).toHaveAttribute(
    'data-catalog-status',
    'live',
  );
  const link = page
    .locator('main')
    .getByRole('link', { name: recipe.id, exact: true })
    .first();
  await expect(link).toHaveAttribute('href', href);
  await link.click();
  await expect(page).toHaveURL(href);
  await expect(
    page.getByRole('link', { name: '返回模型与调优', exact: true }),
  ).toHaveAttribute('href', catalog);
  await page.reload();
  await expect(
    page.getByRole('link', { name: '返回模型与调优', exact: true }),
  ).toHaveAttribute('href', catalog);
  const fresh = await context.newPage();
  await fresh.route('**/index-v2.json', (route) =>
    route.fulfill({ json: baseline }),
  );
  const response = await fresh.goto(href);
  expect(response?.status()).toBe(200);
  await expect(fresh.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(
    fresh.getByRole('link', { name: '返回模型与调优', exact: true }),
  ).toHaveAttribute('href', '/models');
  await fresh.close();
});

test('explicit unavailable recipe snapshots remain in the URL and show an error', async ({
  page,
}) => {
  const snapshot = 'a'.repeat(40);
  await page.goto(
    `/models/recipe?modelId=${model.name}&recipeId=${recipe.id}&dataVersion=${snapshot}`,
  );
  await expect(page).toHaveURL(href + '&dataVersion=' + snapshot);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '目录版本不可用',
  );
});

test('legacy links to a newer live catalog also remove its snapshot from the share URL', async ({
  page,
}) => {
  const current = {
    ...baseline,
    commit: 'c7434c8600284fc48e2831ba959e021ba3d760c5',
  };
  await page.route('**/index-v2.json', (route) =>
    route.fulfill({ json: current }),
  );
  const params = new URLSearchParams({
    modelId: model.name,
    recipeId: recipe.id,
    dataVersion: current.commit,
    returnTo: catalog,
  });
  await page.goto('/models/recipe?' + params);
  await expect(page).toHaveURL(href);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(
    page.getByRole('link', { name: '返回模型与调优', exact: true }),
  ).toHaveAttribute('href', catalog);
  await page.reload();
  await expect(page).toHaveURL(href);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
});
