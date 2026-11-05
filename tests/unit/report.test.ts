import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  baseline,
  recipesOf,
  reportUrl,
} from '../../src/features/catalog/data';
import {
  loadReportDocument,
  selectReportLanguage,
} from '../../src/features/catalog/report';

const recipe = recipesOf(baseline).find(
  (r) => r.key === 'mimo-v2.5/sglang-tp8-h100-optimized',
)!;
afterEach(() => vi.unstubAllGlobals());

describe('report language selection', () => {
  const reports = [
    { lang: 'en', markdown: '# English report' },
    { lang: 'zh', markdown: '# 中文报告' },
  ];
  it('prefers the portal language over the original default or report order', () => {
    expect(selectReportLanguage({ initial: 'zh', reports }, 'en')).toBe('en');
    expect(selectReportLanguage({ initial: 'en', reports }, 'zh-CN')).toBe(
      'zh',
    );
  });
  it('keeps an available original language when a translation is missing', () => {
    expect(
      selectReportLanguage({ initial: 'zh', reports: [reports[1]] }, 'en'),
    ).toBe('zh');
    expect(
      selectReportLanguage({ initial: 'en', reports: [reports[0]] }, 'zh-CN'),
    ).toBe('en');
  });
  it('ignores empty translations and falls back when the original default is invalid', () => {
    expect(
      selectReportLanguage(
        {
          initial: 'en',
          reports: [{ lang: 'en', markdown: '  ' }, reports[1]],
        },
        'en',
      ),
    ).toBe('zh');
    expect(
      selectReportLanguage({ initial: 'missing', reports: [reports[1]] }, 'en'),
    ).toBe('zh');
  });
  it.each([
    null,
    {},
    { reports: [] },
    { reports: [{ lang: 'en' }] },
    { reports: 'invalid' },
  ])('tolerates unsupported metadata: %j', (value) => {
    expect(selectReportLanguage(value, 'en')).toBeNull();
  });
  it('localizes standalone links without changing the source report path', () => {
    expect(reportUrl(recipe, undefined, 'en')).toMatch(
      /mimo-v2\.5-h100-report\.html#en$/,
    );
    expect(reportUrl(recipe, undefined, 'zh')).toMatch(
      /mimo-v2\.5-h100-report\.html#zh$/,
    );
  });
});

describe('original report loading', () => {
  it('retains the immutable catalog snapshot', async () => {
    const html = '<html><body>Original report</body></html>';
    const fetch = vi.fn().mockResolvedValue(new Response(html));
    vi.stubGlobal('fetch', fetch);
    await expect(loadReportDocument(recipe, baseline.commit)).resolves.toBe(
      html,
    );
    expect(fetch.mock.calls[0][0]).toContain(
      `/${baseline.commit}/models/mimo-v2.5/mimo-v2.5-h100-report.html`,
    );
  });
  it('rejects failed requests and incomplete documents instead of masking load errors as language fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Missing', { status: 404 })),
    );
    await expect(loadReportDocument(recipe, baseline.commit)).rejects.toThrow(
      '404',
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<p>Incomplete</p>')),
    );
    await expect(loadReportDocument(recipe, baseline.commit)).rejects.toThrow(
      '完整的 HTML',
    );
  });
});
