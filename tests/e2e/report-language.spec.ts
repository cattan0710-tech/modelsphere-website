import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import baseline from '../../content/catalog/baseline.json';
import { parseCatalog, type Catalog } from '../../src/features/catalog/data';

const bilingual = readFileSync(
  'tests/fixtures/catalog/bilingual-report.html',
  'utf8',
);
const yaml = readFileSync('tests/fixtures/catalog/mimo.yaml', 'utf8');
const query = `?modelId=mimo-v2.5&recipeId=sglang-tp8-h100-optimized&dataVersion=${baseline.commit}&returnTo=%2Fmodels%3Ffamily%3Dmimo&tab=performance`;
const shortHref =
  '/recipe?model=mimo-v2.5&id=sglang-tp8-h100-optimized&tab=performance';
const fallback =
  'This report is unavailable in the selected language. Showing the original report.';
const frame = (page: Page) => page.frameLocator('#benchmark-report');

async function mockSources(
  page: Page,
  html: string,
  catalog: Catalog = parseCatalog(baseline),
) {
  await page.route('https://modelsphere.github.io/model-catalog/**', (route) =>
    route.request().url().endsWith('index-v2.json')
      ? route.fulfill({ json: catalog })
      : route.fulfill({ json: { revisions: [] } }),
  );
  await page.route(
    'https://raw.githubusercontent.com/modelsphere/model-catalog/**',
    (route) =>
      route.fulfill({
        body: route.request().url().endsWith('.html') ? html : yaml,
        contentType: 'text/plain',
      }),
  );
}

async function chooseLanguage(page: Page, language: 'English' | '简体中文') {
  await page
    .getByRole('combobox', { name: /^(Change language|切换语言)$/ })
    .click();
  await page.getByRole('option', { name: language, exact: true }).click();
}

function withReports(reports: unknown[], initial = 'zh') {
  return bilingual.replace(
    /(<script id="autotune-report-data" type="application\/json">)[\s\S]*?(<\/script>)/,
    (_, start, end) =>
      start +
      JSON.stringify({ initial, reports }).replace(/</g, '\\u003c') +
      end,
  );
}

const zh = {
  lang: 'zh',
  markdown: '中文性能报告',
  comparison: { gain: 119.9 },
};
const en = {
  lang: 'en',
  markdown: 'English performance report',
  comparison: { gain: 119.9 },
};

test('embedded performance report follows both portal language switches and retains its isolation and interactions', async ({
  page,
}) => {
  await mockSources(page, bilingual);
  await page.goto('/models/recipe' + query);
  await expect(
    frame(page).getByRole('heading', { name: '中文性能报告' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '查看完整报告', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '全屏观看', exact: true }),
  ).toBeEnabled();
  await chooseLanguage(page, 'English');
  await expect(page).toHaveURL('/en' + shortHref);
  await expect(frame(page).locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    frame(page).getByRole('heading', { name: 'English performance report' }),
  ).toBeVisible();
  await expect(frame(page).locator('#gain')).toHaveText('119.9%');
  await expect(page.getByText(fallback, { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'View full report', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('#benchmark-report')).toHaveAttribute(
    'sandbox',
    'allow-scripts',
  );
  await expect(frame(page).locator('body')).toHaveAttribute(
    'data-parent-access',
    'blocked',
  );
  await expect(page.locator('body')).not.toHaveAttribute('data-report-escaped');
  await frame(page).getByRole('button', { name: 'Show raw results' }).click();
  await expect(
    frame(page).getByText('Original benchmark results'),
  ).toBeVisible();
  await frame(page).getByRole('button', { name: '中文', exact: true }).click();
  await expect(
    frame(page).getByRole('heading', { name: '中文性能报告' }),
  ).toBeVisible();
  await chooseLanguage(page, '简体中文');
  await expect(page).toHaveURL(shortHref);
  await expect(frame(page).locator('html')).toHaveAttribute('lang', 'zh-CN');
});

for (const [name, html] of [
  ['Chinese-only report', withReports([zh])],
  [
    'empty English translation',
    withReports([{ ...en, markdown: ' ' }, zh], 'en'),
  ],
  ['invalid original language', withReports([zh], 'missing')],
  [
    'legacy Chinese HTML',
    '<!doctype html><html lang="zh-CN"><body><h1>中文性能报告</h1></body></html>',
  ],
  [
    'malformed language metadata',
    '<!doctype html><html lang="zh-CN"><body><script id="autotune-report-data" type="application/json">invalid</script><h1>中文性能报告</h1></body></html>',
  ],
] as const) {
  test(`English portal preserves the original with a clear fallback for ${name}`, async ({
    page,
  }) => {
    await mockSources(page, html);
    await page.goto('/en/models/recipe' + query);
    await expect(
      frame(page).getByRole('heading', { name: '中文性能报告' }),
    ).toBeVisible();
    await expect(page.getByText(fallback, { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Fullscreen', exact: true }),
    ).toBeEnabled();
  });
}

test('English-only report stays readable when the portal switches to Chinese', async ({
  page,
}) => {
  await mockSources(page, withReports([en], 'en'));
  await page.goto('/en/models/recipe' + query);
  await expect(
    frame(page).getByRole('heading', { name: en.markdown }),
  ).toBeVisible();
  await expect(page.getByText(fallback, { exact: true })).toHaveCount(0);
  await chooseLanguage(page, '简体中文');
  await expect(
    frame(page).getByRole('heading', { name: en.markdown }),
  ).toBeVisible();
  await expect(
    page.getByText('该报告暂无当前语言版本，已显示原始报告。'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '全屏观看', exact: true }),
  ).toBeEnabled();
});

test('each comparison opens its matching report in the website and remains selected after reload', async ({
  page,
}) => {
  const catalog = parseCatalog(structuredClone(baseline));
  const model = catalog.models.find((item) => item.name === 'mimo-v2.5')!;
  const original = model.tuning.find((item) =>
    item.optimized.startsWith('sglang-tp8-h100-optimized@'),
  )!;
  const secondReport = 'second-comparison-report.html';
  model.reports.push(secondReport);
  model.tuning.push({
    ...original,
    baseline: 'sglang-tp8-h100-baseline@0.9.0',
    report: secondReport,
    workloads: [],
    uplift: 1,
  });
  await mockSources(page, bilingual, catalog);
  await page.route('**/second-comparison-report.html', (route) =>
    route.fulfill({
      body: '<!doctype html><html lang="zh-CN"><body><h1>第二份性能报告</h1></body></html>',
      contentType: 'text/html',
    }),
  );
  await page.goto('/models/recipe' + query.replace('&tab=performance', ''));
  const reportLink = page.locator(
    'a[href*="report=second-comparison-report.html"]',
  );
  await expect(reportLink).toBeVisible();
  await expect(reportLink).not.toHaveAttribute('target', '_blank');
  await reportLink.click();
  await expect(
    frame(page).getByRole('heading', { name: '第二份性能报告' }),
  ).toBeVisible();
  await expect(page.getByLabel('性能报告', { exact: true })).toHaveValue(
    secondReport,
  );
  const selectedUrl = page.url();
  await page.reload();
  await expect(
    frame(page).getByRole('heading', { name: '第二份性能报告' }),
  ).toBeVisible();
  expect(page.url()).toBe(selectedUrl);
  await page
    .getByLabel('性能报告', { exact: true })
    .selectOption(original.report!);
  await expect(
    frame(page).getByRole('heading', { name: '中文性能报告' }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get('report')).toBe(original.report);
  expect(new URL(page.url()).searchParams.has('dataVersion')).toBe(false);
  expect(
    await page.evaluate(() => window.history.state?.state?.catalogDataVersion),
  ).toBe(baseline.commit);
});

for (const width of [390, 1440]) {
  test(`report stays readable at ${width}px when native fullscreen is unavailable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      HTMLElement.prototype.requestFullscreen = () =>
        Promise.reject(new Error('Unavailable'));
    });
    await mockSources(page, bilingual);
    await page.goto('/models/recipe' + query);
    await expect(
      frame(page).getByRole('heading', { name: '中文性能报告' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '全屏观看', exact: true }).click();
    await expect(
      page.getByRole('status').filter({ hasText: '暂时无法全屏观看' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '查看完整报告', exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      frame(page).getByRole('heading', { name: '中文性能报告' }),
    ).toBeVisible();
  });
}

test('language metadata retains assets and cannot inject HTML when reserialized', async ({
  page,
}) => {
  const markdown =
    'English report </script><script>parent.postMessage("injected", "*")</script>';
  await mockSources(
    page,
    withReports([{ ...en, markdown, assets: { chart: 'chart.svg' } }, zh]),
  );
  await page.goto('/en/models/recipe' + query);
  await expect(
    frame(page).getByRole('heading', { name: markdown }),
  ).toBeVisible();
  const metadata = await frame(page)
    .locator('#autotune-report-data')
    .textContent();
  expect(JSON.parse(metadata!).reports[0].assets).toEqual({
    chart: 'chart.svg',
  });
  await expect(frame(page).locator('script')).toHaveCount(2);
});
