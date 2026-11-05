import React, { useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  defaultLocale,
  languageHref,
  readLocalePreference,
  rememberLocale,
} from '@site/src/lib/locale';

export default function Root({ children }: { children: React.ReactNode }) {
  const { i18n, siteConfig } = useDocusaurusContext();
  useEffect(() => {
    // An explicit English URL takes precedence over browser preferences.
    if (i18n.currentLocale === 'en') return;
    const locale = defaultLocale(
      navigator.language || navigator.languages?.[0] || 'zh-CN',
      readLocalePreference(),
    );
    // Without storage, automatic redirects would undo manual Chinese selection.
    if (!rememberLocale(locale) || locale === i18n.currentLocale) return;
    window.location.replace(
      languageHref(
        window.location.pathname,
        window.location.search,
        window.location.hash,
        siteConfig.baseUrl,
        i18n.currentLocale,
      ),
    );
  }, [i18n.currentLocale, siteConfig.baseUrl]);
  return <>{children}</>;
}
