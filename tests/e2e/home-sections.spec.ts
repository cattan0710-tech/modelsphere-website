import { expect, test } from '@playwright/test';
import source from '../../docs/design/sources/stitch-home-sections-copy.json';
import communitySource from '../../docs/design/sources/stitch-community.json';
import continuationSource from '../../docs/design/sources/stitch-continuation.json';
import qosSource from '../../docs/design/sources/stitch-qos-scaling.json';

// Approved changes reserve loop-arrow gaps and remove the CTA metadata row.
const modules = {
  ...Object.fromEntries(
    Object.entries(source.modules).filter(([id]) => id !== 'qos-scaling'),
  ),
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
        'dynamic-scaling',
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
    if (id === 'fault-tolerance') {
      expect(measured.text.replace(/\s/g, '')).toBe(
        continuationSource.text.replace(/\s/g, ''),
      );
      expect(measured.icons).toEqual(continuationSource.icons);
      await expect(section.locator('.continuation-icon').first()).toHaveCSS(
        'font-family',
        '"ModelSphere Continuation Symbols Filled"',
      );
      await expect(section.locator('.continuation-feature')).toHaveCount(3);
      await expect(section.locator('.continuation-step')).toHaveCount(4);
      const semanticColors = await section.evaluate((element) => ({
        expected: getComputedStyle(element)
          .getPropertyValue('--color-home-success')
          .trim(),
        actual: getComputedStyle(element.querySelector('.continuation-step-4')!)
          .color,
      }));
      const expectedSuccess = await page.evaluate((color) => {
        const probe = document.createElement('span');
        probe.style.color = color;
        document.body.append(probe);
        const result = getComputedStyle(probe).color;
        probe.remove();
        return result;
      }, semanticColors.expected);
      expect(semanticColors.actual).toBe(expectedSuccess);
      await expect(section.locator('.continuation-title a')).toHaveAttribute(
        'href',
        'https://github.com/modelsphere/modelsphere/blob/d5c892d2c1747b9411b423dae5c776d0c84a8003/docs/deploy-a-model.md#continuation-gateway-optional',
      );
      const layout = await section
        .locator('.continuation-layout')
        .evaluate((element) => {
          const [left, right] = Array.from(element.children).map((child) =>
            child.getBoundingClientRect(),
          );
          return {
            left: left.right,
            right: right.left,
            topDelta: Math.abs(left.top - right.top),
            height: element.getBoundingClientRect().height,
          };
        });
      expect(layout.left).toBeLessThan(layout.right);
      expect(layout.topDelta).toBeLessThan(1);
      expect(layout.height).toBeLessThan(950);
      return;
    }
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
    if ('columns' in expected && Array.isArray(expected.columns)) {
      const columns: number[] = expected.columns;
      measured.columns.forEach((width, index) =>
        expect(width).toBeCloseTo(columns[index], 1),
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
    page.locator('#dynamic-scaling [data-home-pair] > *'),
  ).toHaveCount(2);
  await expect(
    page.locator('#autotune-evolution [data-home-pair] > *'),
  ).toHaveCount(2);
  await expect(page.locator('[data-home-intro]')).toHaveCount(7);
  const signals = page.locator(
    '[data-home-design] .animate-pulse,[data-home-design] .animate-ping',
  );
  expect(await signals.count()).toBe(14);
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

for (const [id, source] of Object.entries(qosSource)) {
  test(`${id} follows the selected source copy, icons and chart geometry`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator(`#${id}`);
    const measured = await section.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const text: string[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (
          !node.parentElement!.closest(
            '.material-symbols-outlined,[aria-hidden="true"],script',
          )
        )
          text.push(node.textContent!);
      }
      return {
        text: text.join(' ').replace(/\s+/g, ' ').trim(),
        icons: Array.from(
          element.querySelectorAll('.material-symbols-outlined'),
        ).map((icon) => icon.textContent!.trim()),
        paths: Array.from(
          element.querySelectorAll('svg path,svg polygon,svg polyline'),
        ).map((path) =>
          (path.getAttribute('d') ?? path.getAttribute('points') ?? '')
            .replace(/\s+/g, ' ')
            .trim(),
        ),
      };
    });
    expect(measured.text.replace(/\s/g, '')).toBe(
      source.text.replace(/\s/g, ''),
    );
    expect(measured.icons).toEqual(source.icons);
    for (const path of source.svgPaths)
      expect(measured.paths).toContain(path.replace(/\s+/g, ' ').trim());
    if (id === 'dynamic-scaling') {
      for (const count of [8, 6, 2]) {
        const scenario = section.locator(`[data-gpu-scenario="${count}"]`);
        await expect(scenario.locator('[data-model="glm"]')).toHaveCount(count);
        await expect(scenario.locator('[data-model="minimax"]')).toHaveCount(
          10 - count,
        );
      }
      await expect(
        section.locator('.material-symbols-outlined').first(),
      ).toHaveCSS('font-family', '"ModelSphere Scaling Symbols"');
    }
    await section.screenshot({
      path: `reports/${id}-desktop.png`,
      style: '.site-header { visibility: hidden; }',
    });
  });
}

test('QoS sections fit both themes and supported widths, including English and no-script rendering', async ({
  page,
  browser,
}) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    for (const width of [320, 390, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const id of ['qos-scaling', 'dynamic-scaling']) {
        const section = page.locator(`#${id}`);
        const box = await section.evaluate((element) => ({
          width: element.clientWidth,
          scroll: element.scrollWidth,
        }));
        expect(box.scroll).toBeLessThanOrEqual(box.width + 1);
        if (width === 390 || width === 1280)
          await section.screenshot({
            path: `reports/${id}-${theme}-${width}.png`,
            style: '.site-header { visibility: hidden; }',
          });
      }
    }
  }
  const context = await browser.newContext({
    javaScriptEnabled: false,
    locale: 'en-US',
  });
  const plain = await context.newPage();
  await plain.goto(new URL('/en/', page.url()).href);
  for (const id of ['qos-scaling', 'dynamic-scaling']) {
    const section = plain.locator(`#${id}`);
    await expect(section).toBeVisible();
    expect(await section.innerText()).not.toMatch(/[\u3400-\u9fff]/);
  }
  await context.close();
});

test('QoS chart limits align with bars and annotations follow unscaled points', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator('#qos-scaling');
  for (const width of [320, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const measured = await section.evaluate((element) => {
      const line = element
        .querySelector('[data-qos-static-limit] i')!
        .getBoundingClientRect();
      const bars = Array.from(
        element.querySelectorAll('[data-qos-static-bar]'),
      ).map((bar) => bar.getBoundingClientRect().top);
      const svg = element
        .querySelector('svg[role="img"]')!
        .getBoundingClientRect();
      const points = ['open', 'tighten'].map((kind) => {
        const wrapper = element.querySelector(`[data-qos-point="${kind}"]`)!;
        const dot = wrapper.querySelector('i')!.getBoundingClientRect();
        const annotation = wrapper
          .querySelector('span')!
          .getBoundingClientRect();
        return {
          kind,
          x: dot.x + dot.width / 2,
          y: dot.y + dot.height / 2,
          width: dot.width,
          height: dot.height,
          labelX:
            annotation.x + annotation.width * (kind === 'open' ? 0.5 : 0.55),
          labelY: annotation.bottom + (kind === 'open' ? 18 : 14),
        };
      });
      const axes = Array.from(element.querySelectorAll('[data-qos-axis]')).map(
        (axis) => ({
          namespace: axis.namespaceURI,
          font: getComputedStyle(axis).fontFamily,
          size: getComputedStyle(axis).fontSize,
        }),
      );
      return {
        lineY: line.y + line.height / 2,
        bars,
        points,
        axes,
        font: getComputedStyle(element).fontFamily,
        svg: { x: svg.x, y: svg.y, width: svg.width, height: svg.height },
      };
    });
    for (const top of measured.bars)
      expect(Math.abs(top - measured.lineY)).toBeLessThanOrEqual(1);
    for (const point of measured.points) {
      const [x, y] = point.kind === 'open' ? [120, 74] : [295, 103];
      expect(
        Math.abs(point.x - (measured.svg.x + (measured.svg.width * x) / 380)),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(point.y - (measured.svg.y + (measured.svg.height * y) / 150)),
      ).toBeLessThanOrEqual(1);
      expect(point.width).toBe(12);
      expect(point.height).toBe(12);
      expect(Math.abs(point.labelX - point.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(point.labelY - point.y)).toBeLessThanOrEqual(1);
    }
    for (const axis of measured.axes) {
      expect(axis.namespace).toBe('http://www.w3.org/1999/xhtml');
      expect(axis.font).toBe(measured.font);
      expect(axis.size).toBe('12px');
    }
  }
});
