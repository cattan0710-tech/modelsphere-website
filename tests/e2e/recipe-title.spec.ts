import { test, expect } from '@playwright/test';
import baseline from '../../content/catalog/baseline.json';

for (const width of [390, 1440]) {
  test(`recipe title truncation and independent tooltips at ${width}px`, async ({
    page,
  }) => {
    const catalog = structuredClone(baseline);
    const model = catalog.models.find((item) => item.name === 'mimo-v2.5')!;
    const name =
      'MiMo-V2.5-Long-Model-Name-With-Multiple-Hardware-Configurations';
    model.displayName = name;
    await page.route('**/index-v2.json', (route) =>
      route.fulfill({ json: catalog }),
    );
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/models?q=mimo-v2.5');
    await expect(page.locator('main')).toHaveAttribute(
      'data-catalog-status',
      'live',
    );

    const card = page.locator('article[data-recipe-id]').first();
    const title = card.getByRole('heading', { level: 2 }).getByRole('link', {
      name,
      exact: true,
    });
    const modelLink = card.getByRole('link', {
      name: '查看该模型所有配方',
      exact: true,
    });
    const action = card.getByRole('link', { name: '查看配方', exact: true });
    const text = title.locator('span');
    await expect(text).toHaveCSS('white-space', 'nowrap');
    await expect(text).toHaveCSS('text-overflow', 'ellipsis');
    expect(await text.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true,
    );

    const titleBox = (await title.boundingBox())!;
    const iconBox = (await modelLink.boundingBox())!;
    expect(
      Math.abs(
        titleBox.y + titleBox.height / 2 - iconBox.y - iconBox.height / 2,
      ),
    ).toBeLessThan(1);
    expect(iconBox.x).toBeGreaterThanOrEqual(titleBox.x + titleBox.width);
    expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(
      (await card.boundingBox())!.x + (await card.boundingBox())!.width,
    );

    await title.hover();
    const nameTooltip = card.getByRole('tooltip').filter({ hasText: name });
    await expect(nameTooltip).toBeVisible();
    await expect(card).toHaveCSS('z-index', '3');
    await expect(action).not.toHaveCSS('box-shadow', 'none');
    await title.press('Escape');
    await expect(nameTooltip).toBeHidden();

    await modelLink.hover();
    const modelTooltip = card
      .getByRole('tooltip')
      .filter({ hasText: '查看该模型所有配方' });
    await expect(modelTooltip).toBeVisible();
    const tooltipBox = (await modelTooltip.boundingBox())!;
    expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
    expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(width);
    await expect(action).toHaveCSS('box-shadow', 'none');

    // A short title must not show an unnecessary full-name tooltip.
    model.displayName = 'MiMo';
    await page.reload();
    const shortTitle = page
      .getByRole('heading', { level: 2 })
      .getByRole('link', {
        name: 'MiMo',
        exact: true,
      })
      .first();
    await shortTitle.hover();
    await expect(
      page.getByRole('tooltip').filter({ hasText: /^MiMo$/ }),
    ).toHaveCount(0);
  });
}
