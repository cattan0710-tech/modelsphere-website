import { describe, expect, it } from 'vitest';
import { defaultLocale, languageHref } from '../../src/lib/locale';

describe('language navigation', () => {
  it.each([
    ['zh-CN', null, 'zh-CN'],
    ['zh-TW', null, 'zh-CN'],
    ['zh-Hant', null, 'zh-CN'],
    ['ZH', null, 'zh-CN'],
    ['en-US', null, 'en'],
    ['fr-FR', null, 'en'],
    ['ja-JP', null, 'en'],
    ['en-US', 'zh-CN', 'zh-CN'],
    ['zh-CN', 'en', 'en'],
    ['zh-CN', 'invalid', 'zh-CN'],
    ['en-US', 'invalid', 'en'],
  ])('chooses %s with saved preference %s', (language, preference, locale) => {
    expect(defaultLocale(language, preference)).toBe(locale);
  });

  it.each([
    ['/', '/', 'zh-CN', '/en/'],
    ['/en/', '/en/', 'en', '/'],
    ['/models/recipe', '/', 'zh-CN', '/en/models/recipe'],
    ['/en/docs/quickstart', '/en/', 'en', '/docs/quickstart'],
    [
      '/modelsphere-website/models',
      '/modelsphere-website/',
      'zh-CN',
      '/modelsphere-website/en/models',
    ],
    [
      '/modelsphere-website/en/models',
      '/modelsphere-website/en/',
      'en',
      '/modelsphere-website/models',
    ],
  ])(
    'switches %s within its deployment prefix',
    (pathname, base, locale, target) => {
      expect(
        languageHref(
          pathname,
          '?modelId=a&tab=history',
          '#details',
          base,
          locale,
        ),
      ).toBe(target + '?modelId=a&tab=history#details');
    },
  );
});
