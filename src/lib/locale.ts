import { withoutBaseUrl, withBaseUrl } from './site-path';

export type SiteLocale = 'zh-CN' | 'en';
export const localePreferenceKey = 'modelsphere.locale';

function isSiteLocale(locale: string | null): locale is SiteLocale {
  return locale === 'zh-CN' || locale === 'en';
}

export function defaultLocale(
  browserLanguage: string,
  preference: string | null,
): SiteLocale {
  if (isSiteLocale(preference)) return preference;
  return /^zh(?:-|$)/i.test(browserLanguage) ? 'zh-CN' : 'en';
}

export function readLocalePreference(): SiteLocale | null {
  for (const storage of ['sessionStorage', 'localStorage'] as const) {
    try {
      const locale = window[storage].getItem(localePreferenceKey);
      if (isSiteLocale(locale)) return locale;
    } catch {
      // Try the other storage when browser policy blocks this one.
    }
  }
  return null;
}

export function rememberLocale(locale: string): boolean {
  if (!isSiteLocale(locale)) return false;
  let saved = false;
  for (const storage of ['localStorage', 'sessionStorage'] as const) {
    try {
      window[storage].setItem(localePreferenceKey, locale);
      saved = true;
    } catch {
      // Keep manual navigation available when browser storage is blocked.
    }
  }
  return saved;
}

/** Switch languages within the deployment prefix, retaining query and fragment. */
export function languageHref(
  pathname: string,
  search: string,
  hash: string,
  currentBaseUrl: string,
  currentLocale: string,
): string {
  const root =
    currentLocale === 'en'
      ? currentBaseUrl.replace(/en\/$/, '')
      : currentBaseUrl;
  const localPath = withoutBaseUrl(pathname, currentBaseUrl);
  const targetBase = currentLocale === 'en' ? root : `${root}en/`;
  return withBaseUrl(localPath, targetBase) + search + hash;
}
