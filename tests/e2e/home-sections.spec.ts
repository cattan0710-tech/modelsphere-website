import { expect, test } from '@playwright/test';
import source from '../../docs/design/sources/stitch-home-sections-copy.json';
import communitySource from '../../docs/design/sources/stitch-community.json';

// Approved changes reserve loop-arrow gaps and remove the CTA metadata row.
const modules = {
  ...source.modules,
  'autotune-evolution': {
    ...source.modules['autotune-evolution'],
    height: 720,
  },
  'get-started': {
    ...source.modules['get-started'],
    text: 'Production Ready Infrastructure 准备好让你的大模型推理集群提速了吗？ 全套源码完全开源，加入顶尖 AI Infra 工程师共建的下一代推理基础设施。 立即部署 加入开发者交流群',
    height: 392,
  },
};

for (const [id, expected] of Object.entries(modules)) {
  test(`${id} restores every source label, icon and desktop proportion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // The shared footer now uses the approved community design.
    if (id === 'home-footer') {
      const footer = page.locator('footer.community-footer');
      await expect(footer).toBeVisible();
      for (const fragment of [
        ...communitySource.footerCopy.slice(0, 3),
        communitySource.footerCopy.find((copy) => copy.startsWith('©'))!,
      ])
        await expect(footer).toContainText(fragment);
      await expect(
        footer.locator('a[href*="#community-calendar"]'),
      ).toHaveCount(0);
      const links = footer
        .getByRole('navigation', { name: '页脚导航' })
        .getByRole('link');
      await expect(footer.locator('a')).toHaveCount(8);
      await expect(links).toHaveText([
        '首页',
        '模型目录',
        '博客',
        '文档指南',
        '快速开始',
        '社区生态',
        'GitHub',
        '技术交流群',
      ]);
      expect(
        await links.evaluateAll((items) =>
          items.map((item) => item.getAttribute('href')),
        ),
      ).toEqual([
        '/',
        '/models',
        '/blog',
        '/docs',
        process.env.TEST_DOCS_MODE === 'none' ? '/docs' : '/docs/quickstart',
        '/community',
        'https://github.com/modelsphere',
        '/community#community-channels',
      ]);
      const layout = await footer.evaluate((element) => {
        const inner = element.firstElementChild!.getBoundingClientRect();
        return {
          width: element.getBoundingClientRect().width,
          left: inner.left,
          right: inner.right,
          padding: getComputedStyle(element.firstElementChild!).paddingLeft,
        };
      });
      expect(layout.width).toBe(1280);
      expect(layout.left).toBe(1280 - layout.right);
      expect(layout.padding).toBe('32px');
      return;
    }
    const section = page.locator(`#${id}`);
    if (id === 'benchmarks') {
      await expect(section.getByRole('heading', { level: 2 })).toHaveText(
        '开箱即用，性能调优模型 Day-0 部署',
      );
      await expect(section.getByRole('table')).toHaveCount(0);
      const screenshot = section.getByRole('img');
      await screenshot.scrollIntoViewIfNeeded();
      await expect(screenshot).toBeVisible();
      await expect(screenshot).toHaveAttribute(
        'src',
        '/screenshots/console-model-catalog.png',
      );
      await expect
        .poll(() =>
          screenshot.evaluate(
            (image: HTMLImageElement) =>
              image.complete &&
              image.naturalWidth === 2568 &&
              image.naturalHeight === 1528,
          ),
        )
        .toBe(true);
      await expect(section.locator('figcaption')).toHaveCount(0);
      await expect(section.getByRole('link')).toHaveCount(0);
      await expect(section).not.toContainText('Console 实际界面');
      expect(
        await page
          .locator('main > section[id]')
          .evaluateAll((sections) => sections.map((element) => element.id)),
      ).toEqual([
        'hero',
        'comparison',
        'benchmarks',
        'fault-tolerance',
        'qos-scaling',
        'autotune-evolution',
        'get-started',
      ]);
      return;
    }
    const measured = await section.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const text: string[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (
          !node.parentElement!.closest(
            '.material-symbols-outlined,.sr-only,script',
          )
        )
          text.push(node.textContent!);
      }
      return {
        text: text.join(' ').replace(/\s+/g, ' ').trim(),
        height: element.getBoundingClientRect().height,
        columns: Array.from(element.querySelectorAll('thead th')).map(
          (cell) => cell.getBoundingClientRect().width,
        ),
        headings: Array.from(element.querySelectorAll('h2,h3')).map(
          (heading) => ({
            text: heading.textContent!.replace(/\s+/g, ' ').trim(),
            size: getComputedStyle(heading).fontSize,
            line: getComputedStyle(heading).lineHeight,
            weight: getComputedStyle(heading).fontWeight,
            color: getComputedStyle(heading).color,
          }),
        ),
        icons: Array.from(
          element.querySelectorAll('.material-symbols-outlined'),
        ).map((icon) => icon.textContent!.trim()),
        font: document.fonts.check(
          '20px "ModelSphere Home Symbols"',
          'radar speed sync',
        ),
      };
    });
    expect(measured.text).toBe(expected.text);
    expect(measured.icons).toEqual(expected.icons);
    expect(measured.font).toBe(true);
    expect(Math.abs(measured.height - expected.height)).toBeLessThanOrEqual(1);
    expect(measured.headings).toEqual(
      expected.headings.map((heading) => ({
        text: heading.text,
        size: heading.size,
        line: heading.line,
        weight: heading.weight,
        color: heading.color,
      })),
    );
    if ('columns' in expected) {
      measured.columns.forEach((width, index) =>
        expect(width).toBeCloseTo(expected.columns[index], 1),
      );
    }
  });
}

test('source status and chart signals animate without affecting the existing entrance hooks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(
    page.locator('#fault-tolerance [data-home-pair] > *'),
  ).toHaveCount(2);
  await expect(page.locator('#qos-scaling [data-home-pair] > *')).toHaveCount(
    2,
  );
  await expect(
    page.locator('#autotune-evolution [data-home-pair] > *'),
  ).toHaveCount(2);
  await expect(page.locator('[data-home-intro]')).toHaveCount(6);
  const signals = page.locator(
    '[data-home-design] .animate-pulse,[data-home-design] .animate-ping',
  );
  expect(await signals.count()).toBe(9);
  expect(
    await signals.evaluateAll((elements) =>
      elements.every(
        (element) => getComputedStyle(element).animationName !== 'none',
      ),
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await signals.evaluateAll((elements) =>
      elements.every(
        (element) => getComputedStyle(element).animationName === 'none',
      ),
    ),
  ).toBe(true);
});

test('restored modules contain narrow layouts and preserve working section links', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    const surfaces = await page
      .locator(
        '#comparison,#benchmarks,#fault-tolerance,#qos-scaling,#autotune-evolution',
      )
      .evaluateAll((sections) =>
        sections.map((section) => getComputedStyle(section).backgroundColor),
      );
    expect(surfaces[0]).toBe(surfaces[2]);
    expect(surfaces[2]).toBe(surfaces[4]);
    expect(surfaces[1]).toBe(surfaces[3]);
    expect(surfaces[0]).not.toBe(surfaces[1]);
    await expect(page.locator('#get-started > div')).toHaveCSS(
      'background-image',
      colorScheme === 'light'
        ? 'linear-gradient(135deg, rgb(29, 78, 216), rgb(37, 99, 235) 35%, rgb(59, 130, 246) 70%, rgb(67, 56, 202))'
        : 'linear-gradient(135deg, rgb(0, 54, 61), rgb(25, 27, 35) 35%, rgb(39, 42, 50) 70%, rgb(29, 31, 39))',
    );
    for (const width of [320, 390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const preview = page.locator('.home-console-scroller');
      const dimensions = await preview.evaluate((element) => ({
        width: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(dimensions.scrollWidth > dimensions.width).toBe(width < 1024);
      if (width < 1024) {
        await preview.evaluate((element) => {
          element.scrollLeft = element.scrollWidth;
        });
        expect(
          await preview.evaluate((element) => element.scrollLeft),
        ).toBeGreaterThan(0);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 900 });
  const community = page.getByRole('link', {
    name: '推理性能优化社区',
    exact: true,
  });
  await community.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#benchmarks$/);
  await expect(page.locator('#benchmarks')).toBeFocused();
  await expect(page.locator('#benchmarks').getByRole('img')).toBeVisible();
  await expect(
    page.getByRole('link', { name: '立即部署', exact: true }),
  ).toHaveAttribute(
    'href',
    process.env.TEST_DOCS_MODE !== 'none' ? '/docs/quickstart' : '/docs',
  );
  const destination = await page
    .getByRole('link', { name: '立即部署', exact: true })
    .getAttribute('href');
  expect((await page.request.get(destination!)).status()).toBe(200);
  await expect(
    page.getByRole('link', { name: '加入开发者交流群', exact: true }),
  ).toHaveAttribute('href', '#home-community');
});
