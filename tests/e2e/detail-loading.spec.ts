import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import baseline from '../../content/catalog/baseline.json';

const model = baseline.models.find((item) => item.name === 'mimo-v2.5')!;
const recipe = model.variants.find(
  (item) => item.id === 'sglang-tp8-h100-optimized',
)!;
const yaml = readFileSync('tests/fixtures/catalog/mimo.yaml', 'utf8');
const routes = {
  model: `models/detail?modelId=${model.name}`,
  recipe: `models/recipe?modelId=${model.name}&recipeId=${recipe.id}`,
};
const loading = (page: Page) => page.locator('section[aria-busy="true"]');

function gate() {
  let resume = () => {};
  const promise = new Promise<void>((resolve) => {
    resume = resolve;
  });
  return { promise, resume: () => resume() };
}

async function mockSources(page: Page, pending: Promise<void>, fail = false) {
  await page.route(
    'https://modelsphere.github.io/model-catalog/**',
    async (route) => {
      if (route.request().url().endsWith('index-v2.json')) {
        await pending;
        return fail ? route.abort() : route.fulfill({ json: baseline });
      }
      return route.fulfill({
        json: {
          model: model.name,
          id: recipe.id,
          path: recipe.path,
          revisions: [],
        },
      });
    },
  );
  await page.route(
    'https://raw.githubusercontent.com/modelsphere/model-catalog/**',
    (route) => route.fulfill({ body: yaml, contentType: 'text/plain' }),
  );
}

for (const kind of ['model', 'recipe'] as const)
  for (const locale of ['zh-CN', 'en'] as const)
    for (const width of [320, 1440])
      for (const colorScheme of ['light', 'dark'] as const)
        test(`${kind} details show a skeleton before scripts and while data loads in ${locale} at ${width}px ${colorScheme}`, async ({
          page,
        }, info) => {
          const scripts = gate(),
            catalog = gate();
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.setViewportSize({ width, height: 1000 });
          await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
          await mockSources(page, catalog.promise);
          await page.route('**/assets/js/**', async (route) => {
            await scripts.promise;
            await route.continue();
          });
          try {
            await page.goto(`/${locale === 'en' ? 'en/' : ''}${routes[kind]}`, {
              waitUntil: 'commit',
            });
            await expect(loading(page)).toBeVisible();
            await expect(loading(page)).toContainText(
              locale === 'en' ? 'Loading details…' : '正在加载详情…',
            );
            await expect(loading(page)).toHaveCSS('border-top-style', 'solid');
            expect(await page.locator('main').innerText()).not.toContain(
              'JavaScript',
            );
            await info.attach('initial-detail-skeleton', {
              body: await loading(page).screenshot({
                path: info.outputPath('detail-skeleton.png'),
              }),
              contentType: 'image/png',
            });
            scripts.resume();
            await expect(page.locator('main')).toHaveAttribute(
              'data-catalog-status',
              'loading',
            );
            await expect(loading(page)).toBeVisible();
            expect(await page.locator('main').innerText()).not.toContain(
              'JavaScript',
            );
            expect(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              ),
            ).toBe(true);
            const animated = await loading(page)
              .locator('span')
              .evaluateAll((elements) =>
                elements.some(
                  (element) =>
                    getComputedStyle(element).animationName !== 'none',
                ),
              );
            expect(animated).toBe(false);
            catalog.resume();
            await expect(page.locator('main')).toHaveAttribute(
              'data-catalog-status',
              'live',
            );
            await expect(loading(page)).toHaveCount(0);
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(
              model.displayName?.trim() || model.name,
            );
            expect(await page.locator('main').innerText()).not.toContain(
              'JavaScript',
            );
            expect(errors).toEqual([]);
          } finally {
            scripts.resume();
            catalog.resume();
          }
        });

for (const kind of ['model', 'recipe'] as const)
  for (const locale of ['zh-CN', 'en'] as const)
    test(`${kind} details show only the noscript fallback when scripts are disabled in ${locale}`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        locale: 'zh-CN',
      });
      try {
        const page = await context.newPage();
        await page.goto(
          `${baseURL}/${locale === 'en' ? 'en/' : ''}${routes[kind]}`,
        );
        await expect(page.locator('main noscript p')).toBeVisible();
        await expect(page.locator('main noscript p')).toContainText(
          locale === 'en'
            ? 'Live model and recipe details require JavaScript.'
            : '实时模型和配方详情需要 JavaScript。',
        );
        await expect(loading(page)).toBeHidden();
        // Role/text selectors skip noscript, even with browser scripts disabled.
        await expect(page.locator('main noscript a')).toHaveAttribute(
          'href',
          'https://modelsphere.github.io/model-catalog/',
        );
        await expect(page.locator('main noscript a')).toHaveText(
          locale === 'en' ? 'Read the source catalog' : '阅读原始目录',
        );
      } finally {
        await context.close();
      }
    });

for (const kind of ['model', 'recipe'] as const)
  test(`${kind} detail loading ends with the existing unavailable-source state when the request fails`, async ({
    page,
  }) => {
    await mockSources(page, Promise.resolve(), true);
    await page.goto(
      `/models/${kind === 'model' ? 'detail?modelId=missing' : 'recipe?modelId=missing&recipeId=missing'}`,
    );
    await expect(page.locator('main')).toHaveAttribute(
      'data-catalog-status',
      'error',
    );
    await expect(loading(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      '来源不可用，尚无法确认记录',
    );
    expect(await page.locator('main').innerText()).not.toContain('JavaScript');
  });
