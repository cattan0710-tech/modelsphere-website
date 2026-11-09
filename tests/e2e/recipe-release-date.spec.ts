import { test, expect } from '@playwright/test';
import baseline from '../../content/catalog/baseline.json';
import { parseCatalog } from '../../src/features/catalog/data';

for (const context of ['catalog', 'model'] as const) {
  for (const missing of [false, true]) {
    test(`${context} card renders ${missing ? 'missing date fallback' : 'release date'}`, async ({
      page,
    }) => {
      const source = parseCatalog(baseline);
      const model = source.models.find((m) => m.name === 'glm5.3')!;
      const variant = model.variants.find(
        (v) => v.id === 'sglang-tp4-b300-optimized',
      )!;
      const date = variant.releaseDate!;
      if (missing) delete variant.releaseDate;
      await page.route(
        'https://modelsphere.github.io/model-catalog/**',
        (route) =>
          route.request().url().endsWith('index-v2.json')
            ? route.fulfill({ json: source })
            : route.abort(),
      );
      await page.goto(
        context === 'catalog'
          ? '/models?q=glm5.3'
          : '/models/detail?modelId=glm5.3',
      );
      const card = page.locator(
        `[data-recipe-id="${model.name}/${variant.id}"]`,
      );
      const releaseDate = card.locator('[data-recipe-release-date]');
      await expect(releaseDate).toHaveText(
        missing ? '日期未提供' : `当前版本发布于 ${date}`,
      );
      if (missing) {
        await expect(releaseDate.locator('time')).toHaveCount(0);
      } else {
        await expect(releaseDate.locator('time')).toHaveAttribute(
          'datetime',
          date,
        );
      }
    });
  }
}
