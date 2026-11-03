import { expect, test } from '@playwright/test';

const prefix = '/modelsphere-website/';

test('community preserves source layout and local navigation under the Pages prefix', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('community');
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.locator('#community-channels [data-home-pair] > [data-home-pending]'),
  ).toHaveCount(2);
  await expect(
    page.getByRole('img', { name: '微信技术交流群入群二维码' }),
  ).toHaveAttribute(
    'src',
    '/modelsphere-website/community/wechat-group-qr.png',
  );
  await expect(
    page.getByRole('link', { name: '扫码加入技术交流微信群', exact: true }),
  ).toHaveAttribute(
    'href',
    '/modelsphere-website/community/wechat-group-qr.png',
  );
  await expect(page.locator('#community-channels')).not.toContainText('公众号');
  for (const [name, file] of [
    ['范式智能 PHANCY Logo', 'phancy-logo.png'],
    ['睿思智联 RiseUnion Logo', 'riseunion-logo.svg'],
  ]) {
    await expect(page.getByRole('img', { name, exact: true })).toHaveAttribute(
      'src',
      `/modelsphere-website/brand/${file}`,
    );
  }
  await expect(page.locator('body')).not.toContainText(
    /14\.8k|2\.1k|GitHub Stars|Forks|NODE_CLUSTER: READY|TELEMETRY: P99 22ms/,
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '让 AI 基础设施优化成为全社会的“公共资产”',
  );
  await expect(
    page.locator('.desktop-quickstart .header-primary-link'),
  ).toHaveAttribute(
    'href',
    process.env.TEST_DOCS_MODE !== 'none'
      ? '/modelsphere-website/docs/quickstart'
      : '/modelsphere-website/docs',
  );
  const localLinks = await page
    .locator('[data-community-design] a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  const footerNavigation = page.getByRole('navigation', { name: '页脚导航' });
  await expect(footerNavigation.getByRole('link')).toHaveCount(8);
  await expect(
    footerNavigation.getByRole('link', { name: '技术交流群', exact: true }),
  ).toHaveAttribute('href', `${prefix}community#community-channels`);
  await expect(
    footerNavigation.getByRole('link', { name: '快速开始', exact: true }),
  ).toHaveAttribute(
    'href',
    process.env.TEST_DOCS_MODE === 'none'
      ? `${prefix}docs`
      : `${prefix}docs/quickstart`,
  );
  expect(localLinks).toEqual(
    expect.arrayContaining([
      prefix,
      `${prefix}models`,
      `${prefix}docs`,
      `${prefix}blog`,
      `${prefix}community`,
      `${prefix}community/wechat-group-qr.png`,
    ]),
  );
  for (const href of localLinks) expect(href.startsWith(prefix)).toBe(true);
  const loadedFonts = await page.evaluate(
    async () =>
      (
        await document.fonts.load(
          '700 44px "ModelSphere Community Space Grotesk"',
        )
      ).length,
  );
  expect(loadedFonts).toBeGreaterThan(0);
  expect(
    await page.evaluate(() =>
      document.fonts.check('700 44px "ModelSphere Community Space Grotesk"'),
    ),
  ).toBe(true);
  await page.goto('community#community-maintainers');
  await expect(page).toHaveURL(
    /\/modelsphere-website\/community#community-maintainers$/,
  );
  await expect(
    page.getByRole('heading', { name: '社区维护者', exact: true }),
  ).toBeInViewport();
  await page.reload();
  await expect(page.locator('main section')).toHaveCount(4);
  await expect(page.locator('#community-calendar')).toHaveCount(0);
  await expect(page.locator('a[href*="#community-calendar"]')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: '页脚导航' })
    .getByRole('link', { name: '首页', exact: true })
    .click();
  await expect(page).toHaveURL(/\/modelsphere-website\/$/);
  await expect(page.locator('#hero')).toBeVisible();
});
