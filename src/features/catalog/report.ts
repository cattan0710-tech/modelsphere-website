import { z } from 'zod';
import { rawUrl, requestText, type Recipe } from './data';

const languageData = z.looseObject({
  initial: z.string().optional(),
  reports: z.array(z.looseObject({ lang: z.string(), markdown: z.string() })),
});

export interface ReportDocument {
  html: string;
  language: string | null;
  matchesLocale: boolean;
}

export function selectReportLanguage(value: unknown, locale: string) {
  const parsed = languageData.safeParse(value);
  if (!parsed.success) return null;
  const available = parsed.data.reports.filter((r) => r.markdown.trim());
  const requested = locale === 'en' ? 'en' : 'zh';
  return (
    available.find((r) => r.lang === requested)?.lang ??
    available.find((r) => r.lang === parsed.data.initial)?.lang ??
    available[0]?.lang ??
    null
  );
}

/** Adapt the optional standalone-report language data; legacy HTML stays readable. */
export function localizeReportDocument(
  html: string,
  locale: string,
): ReportDocument {
  const document = new DOMParser().parseFromString(html, 'text/html');
  let language = document.documentElement.lang.split('-')[0] || null;
  const script = document.querySelector<HTMLScriptElement>(
    'script#autotune-report-data[type="application/json"]',
  );
  if (script) {
    try {
      const payload: unknown = JSON.parse(script.textContent ?? '');
      const selected = selectReportLanguage(payload, locale);
      if (selected) {
        // Preserve every original report, asset and comparison field. Escaping '<'
        // prevents JSON strings from becoming executable HTML during serialization.
        script.textContent = JSON.stringify({
          ...languageData.parse(payload),
          initial: selected,
        }).replace(/</g, '\\u003c');
        language = selected;
        document.documentElement.lang = selected === 'zh' ? 'zh-CN' : selected;
        html = '<!doctype html>\n' + document.documentElement.outerHTML;
      }
    } catch {
      // An unsupported or malformed metadata block must not hide the original report.
    }
  }
  return {
    html,
    language,
    matchesLocale: language === (locale === 'en' ? 'en' : 'zh'),
  };
}

export async function loadReportDocument(
  r: Recipe,
  commit: string,
  signal?: AbortSignal,
): Promise<string> {
  const t = r.tuning[0];
  if (!t?.report || !r.model.reports.includes(t.report))
    throw new Error('该配方未关联性能报告');
  const html = await requestText(
    rawUrl(commit, `models/${r.model.name}/${t.report}`),
    signal,
  );
  if (!/<html[\s>]/i.test(html) || !/<body[\s>]/i.test(html))
    throw new Error('性能报告不是完整的 HTML 文档');
  return html;
}
