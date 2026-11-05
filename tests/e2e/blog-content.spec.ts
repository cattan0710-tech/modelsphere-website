import { test, expect, type Page } from '@playwright/test';
import {
  readBlogExpectations,
  expectedBlogList,
} from '../helpers/blog-expectations';

const blog = readBlogExpectations();
const listing = blog.posts.filter((post) => post.id !== blog.featuredId);
const staticIds = [
  ...blog.posts.filter((post) => post.id === blog.featuredId),
  ...listing,
].map((post) => post.id);

async function expectIds(
  page: Page,
  ids: string[],
  selector = '#posts [data-post-id]',
) {
  const cards = page.locator(selector);
  await expect(cards).toHaveCount(ids.length);
  expect(
    await cards.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-post-id')),
    ),
  ).toEqual(ids);
}

test.describe('published blog content acceptance', () => {
  test.skip(
    blog.source !== 'content',
    'Fixed Mock samples have their own complete regression suite.',
  );

  test('listing and pagination exactly match published authoring inputs', async ({
    page,
  }) => {
    const { pages } = expectedBlogList(blog);
    for (let number = 1; number <= pages; number++) {
      await page.goto(`/blog?page=${number}`);
      if (!blog.posts.length) {
        await expect(
          page.getByRole('heading', { name: '尚无公开文章' }),
        ).toBeVisible();
        await expectIds(page, [], '[data-post-id]');
      } else {
        await expect(page.locator('[data-blog-enhanced="true"]')).toBeVisible();
        await expectIds(
          page,
          expectedBlogList(blog, { page: number }).posts.map((post) => post.id),
        );
        await expect(page.locator('#featured [data-post-id]')).toHaveCount(
          number === 1 && blog.featuredId ? 1 : 0,
        );
      }
    }
  });

  test('no scripts and failed scripts retain every published summary', async ({
    browser,
    baseURL,
  }) => {
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({
        javaScriptEnabled,
        locale: 'zh-CN',
      });
      try {
        const page = await context.newPage();
        if (javaScriptEnabled)
          await page.route('**/*.js', (route) => route.abort());
        const response = await page.goto(
          `${baseURL}/blog?q=unsubmitted-filter`,
        );
        expect(response?.status()).toBe(200);
        await expectIds(page, staticIds, '[data-post-id]');
        await expect(page.getByRole('searchbox')).toHaveCount(0);
        for (const post of blog.posts) {
          const card = page.locator(`[data-post-id="${post.id}"]`);
          await expect(card.locator('p')).toHaveText(post.summary);
          await expect(
            card.getByRole('heading').getByRole('link'),
          ).toHaveAttribute('href', post.href);
        }
        for (const post of blog.posts.filter(
          (post) => post.kind === 'internal',
        )) {
          expect((await page.goto(`${baseURL}${post.href}`))?.status()).toBe(
            200,
          );
          await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            post.title,
          );
          await expect(page.locator('article')).not.toBeEmpty();
          await expect(
            page.getByRole('button', { name: '复制文章链接' }),
          ).toBeHidden();
        }
      } finally {
        await context.close();
      }
    }
  });

  if (listing.length) {
    test('cards support hover and keyboard focus without requiring a cover', async ({
      page,
    }) => {
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({
          colorScheme,
          reducedMotion: 'no-preference',
        });
        await page.goto('/blog');
        await expect(page.locator('[data-blog-enhanced="true"]')).toBeVisible();
        const card = page.locator('#posts [data-post-id]').first();
        const title = card.getByRole('heading').getByRole('link');
        const read = card.getByRole('link', { name: /阅读全文/ });
        const arrow = read.locator('[aria-hidden]');
        const original = await title.evaluate(
          (node) => getComputedStyle(node).color,
        );
        const accent = await read.evaluate(
          (node) => getComputedStyle(node).color,
        );
        await card.hover({ position: { x: 12, y: 12 } });
        await expect(title).toHaveCSS('color', accent);
        expect(original).not.toBe(accent);
        await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)');
        await expect(arrow).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 3, -3)');
        await page.mouse.move(0, 0);
        await expect(title).toHaveCSS('color', original);
        await title.focus();
        await expect(title).toHaveCSS('color', accent);
        await expect(card).toHaveCSS('transform', 'none');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await card.hover({ position: { x: 12, y: 12 } });
        await expect(card).toHaveCSS('transform', 'none');
        await expect(arrow).toHaveCSS('transform', 'none');
      }
    });

    test('summary count, text and layout follow the current content at every breakpoint', async ({
      page,
    }) => {
      await page.goto('/blog');
      const expected = expectedBlogList(blog).posts;
      for (const width of [320, 390, 767, 768, 1024, 1279, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await expectIds(
          page,
          expected.map((post) => post.id),
        );
        for (const post of expected) {
          const summary = page.locator(`[data-post-id="${post.id}"] p`);
          await expect(summary).toHaveText(post.summary);
          expect(
            await summary.evaluate(
              (node) => node.scrollHeight <= node.clientHeight + 1,
            ),
          ).toBe(true);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    });
  }

  if (blog.posts.length) {
    test('search, composition, refresh, history and theme preserve the submitted query', async ({
      page,
    }) => {
      const query = Array.from(blog.posts[0].title).slice(0, 50).join('');
      const ids = expectedBlogList(blog, { q: query }).posts.map(
        (post) => post.id,
      );
      await page.goto('/blog');
      const search = page.getByRole('searchbox', { name: '搜索文章' });
      await search.fill(query);
      await search.dispatchEvent('compositionstart');
      await search.press('Enter');
      expect(new URL(page.url()).searchParams.has('q')).toBe(false);
      await search.dispatchEvent('compositionend');
      await search.press('Enter');
      await expect
        .poll(() => new URL(page.url()).searchParams.get('q'))
        .toBe(query);
      await expectIds(page, ids);
      await expect(page.locator('#featured')).toHaveCount(0);
      await expect(search).toBeFocused();
      await page.reload();
      await expect(search).toHaveValue(query);
      await expectIds(page, ids);
      await search.fill('尚未提交的草稿');
      const before = page.url();
      await page.locator('.theme-toggle').click();
      expect(page.url()).toBe(before);
      await expect(search).toHaveValue('尚未提交的草稿');
      await page.goBack();
      await expect(search).toHaveValue('');
      await page.goForward();
      await expect(search).toHaveValue(query);
      await expectIds(page, ids);
    });

    test('canonical queries and empty results retain working controls', async ({
      page,
    }) => {
      const query = Array.from(blog.posts[0].title).slice(0, 50).join('');
      await page.goto(
        `/blog?q=${encodeURIComponent(query)}&q=ignored&category=invalid&tag=missing&page=-1&unknown=x`,
      );
      await expect(
        page.getByText('无效分类已清除；无效标签已清除；无效页码已重置'),
      ).toBeVisible();
      await expectIds(
        page,
        expectedBlogList(blog, { q: query }).posts.map((post) => post.id),
      );
      expect([...new URL(page.url()).searchParams.keys()]).toEqual(['q']);
      const missing = 'no-matching-article-6764703f';
      expect(expectedBlogList(blog, { q: missing }).posts).toHaveLength(0);
      await page.goto(`/blog?q=${missing}`);
      await expect(
        page.getByRole('heading', { name: '未找到匹配内容' }),
      ).toBeVisible();
      await page.getByRole('button', { name: '清除筛选' }).click();
      await expect(page).toHaveURL(/\/blog$/);
      await expect(page.getByRole('searchbox')).toBeFocused();
      await expectIds(
        page,
        expectedBlogList(blog).posts.map((post) => post.id),
      );
    });
  }

  const tagged = blog.posts.find(
    (post) => post.categoryId && post.tagIds.length,
  );
  if (tagged) {
    test('category and tag use AND with source-derived membership', async ({
      page,
    }) => {
      const category = tagged.categoryId!;
      await page.goto(`/blog?category=${category}`);
      await expect(page.locator('[data-blog-enhanced="true"]')).toBeVisible();
      const toggle = page
        .getByRole('group', { name: '热门标签' })
        .getByRole('button')
        .first();
      const label = (await toggle.innerText()).trim().slice(1);
      const tag = blog.tags.find((item) => item.label === label)!.id;
      await toggle.click();
      await expect
        .poll(() => new URL(page.url()).searchParams.get('tag'))
        .toBe(tag);
      await expectIds(
        page,
        expectedBlogList(blog, { category, tag }).posts.map((post) => post.id),
      );
      await toggle.click();
      await expect(page).not.toHaveURL(/tag=/);
      await expectIds(
        page,
        expectedBlogList(blog, { category }).posts.map((post) => post.id),
      );
      await page.goBack();
      await expectIds(
        page,
        expectedBlogList(blog, { category, tag }).posts.map((post) => post.id),
      );
    });
  }

  for (const post of blog.posts.filter((post) => post.kind === 'internal')) {
    test(`published article ${post.id} supports direct loads, themes, copying and mobile layout`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: {
            writeText: async (value: string) => {
              (window as Window & { copied?: string }).copied = value;
            },
          },
        });
      });
      expect((await page.goto(post.href))?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        post.title,
      );
      const canonical = page.locator('link[rel="canonical"]').last();
      expect(new URL((await canonical.getAttribute('href'))!).pathname).toBe(
        post.href,
      );
      await page.getByRole('button', { name: '复制文章链接' }).click();
      await expect(
        page.getByRole('button', { name: '已复制链接' }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => (window as Window & { copied?: string }).copied,
        ),
      ).toBe(await canonical.getAttribute('href'));
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme });
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            post.title,
          );
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
        }
      }
    });
  }
});
