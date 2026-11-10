import { test, expect } from '@playwright/test';
import baseline from '../../content/catalog/baseline.json';
import { parseCatalog } from '../../src/features/catalog/data';

for (const width of [390, 1440]) {
  test(`model recipes sort by gain, recipe name and date at ${width}px`, async ({
    page,
  }) => {
    const source = parseCatalog(structuredClone(baseline));
    const model = source.models.find((item) => item.name === 'glm5.3')!;
    const template = model.variants[0];
    model.variants = [
      { ...template, id: 'alpha', releaseDate: '2026-11-10' },
      { ...template, id: 'bravo', releaseDate: '2026-10-01' },
      { ...template, id: 'charlie', releaseDate: undefined },
      { ...template, id: 'delta', releaseDate: '2026-11-01' },
    ].map((variant) => ({
      ...variant,
      path: `models/${model.name}/${variant.id}.yaml`,
      history: `models/${model.name}/${variant.id}.history.json`,
    }));
    model.tuning = [
      {
        optimized: `alpha@${template.version}`,
        uplift: 10,
        workloads: [],
        baseline: '',
      },
      {
        optimized: `bravo@${template.version}`,
        uplift: 50,
        workloads: [],
        baseline: '',
      },
      {
        optimized: `delta@${template.version}`,
        uplift: 50,
        workloads: [],
        baseline: '',
      },
    ];
    const catalog = parseCatalog(source);
    await page.route(
      'https://modelsphere.github.io/model-catalog/**',
      (route) =>
        route.request().url().endsWith('index-v2.json')
          ? route.fulfill({ json: catalog })
          : route.abort(),
    );
    await page.setViewportSize({ width, height: 1000 });
    const returnTo = '/models?q=glm5.3&layout=table';
    await page.goto(
      `/models/detail?modelId=${model.name}&dataVersion=${source.commit}&returnTo=${encodeURIComponent(returnTo)}`,
    );
    const section = page.getByRole('region', { name: '可用部署配方 · 4' });
    const sort = section.getByRole('combobox', { name: '排序方式' });
    async function expectOrder(ids: string[]) {
      await expect
        .poll(() =>
          section
            .locator('[data-recipe-id]')
            .evaluateAll((cards) =>
              cards.map((card) => card.getAttribute('data-recipe-id')),
            ),
        )
        .toEqual(ids.map((id) => `${model.name}/${id}`));
    }
    async function choose(label: string) {
      await sort.click();
      await page.getByRole('option', { name: label, exact: true }).click();
    }

    await expect(sort).toHaveText('按吞吐量提升排序');
    await expectOrder(['bravo', 'delta', 'alpha', 'charlie']);
    await choose('按配方名称 A–Z');
    await expectOrder(['alpha', 'bravo', 'charlie', 'delta']);
    await choose('按配方名称 Z–A');
    await expectOrder(['delta', 'charlie', 'bravo', 'alpha']);
    await choose('按最新发布排序');
    await expectOrder(['alpha', 'delta', 'bravo', 'charlie']);
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/model' &&
        url.searchParams.get('sort') === 'updated-desc' &&
        url.searchParams.get('dataVersion') === source.commit,
    );
    await page.reload();
    await expect(sort).toHaveText('按最新发布排序');
    await expectOrder(['alpha', 'delta', 'bravo', 'charlie']);
    await page.goBack();
    await expect(sort).toHaveText('按配方名称 Z–A');
    await expectOrder(['delta', 'charlie', 'bravo', 'alpha']);
    await page.goForward();
    await expect(sort).toHaveText('按最新发布排序');
    await choose('按吞吐量提升排序');
    await expectOrder(['bravo', 'delta', 'alpha', 'charlie']);
    await expect(page).toHaveURL((url) => !url.searchParams.has('sort'));
    await expect(
      page.getByRole('navigation', { name: '面包屑' }).getByRole('link', {
        name: '模型与调优',
        exact: true,
      }),
    ).toHaveAttribute('href', returnTo);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
