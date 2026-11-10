import type { Recipe } from './data';

export function modelRoute(modelId: string, dataVersion = '', sort = '') {
  const params = new URLSearchParams({ id: modelId });
  if (dataVersion) params.set('dataVersion', dataVersion);
  if (sort) params.set('sort', sort);
  return '/model?' + params.toString();
}

export function recipeRoute(modelId: string, recipeId: string, search = '') {
  const source = new URLSearchParams(search);
  const params = new URLSearchParams({ model: modelId, id: recipeId });
  for (const key of ['dataVersion', 'version', 'tab', 'report']) {
    const value = source.get(key);
    if (value) params.set(key, value);
  }
  // Legacy redirects keep this until DetailPage moves it into history state.
  if (source.has('returnTo'))
    params.set('returnTo', catalogReturnTo(source.get('returnTo')));
  return '/recipe?' + params.toString();
}

export function modelNavigationState(version = '', returnTo?: string) {
  return {
    catalogDataVersion: /^[a-f0-9]{40}$/.test(version) ? version : '',
    catalogReturnTo: catalogReturnTo(returnTo),
  };
}

export function readModelNavigationState(value: unknown) {
  const state =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  return modelNavigationState(
    typeof state.catalogDataVersion === 'string'
      ? state.catalogDataVersion
      : '',
    typeof state.catalogReturnTo === 'string'
      ? state.catalogReturnTo
      : undefined,
  );
}

export const recipeTabs = [
  { id: 'deployment', label: '部署配置' },
  { id: 'performance', label: '性能对照' },
] as const;
export type RecipeTab = (typeof recipeTabs)[number]['id'];

export function recipeTab(value: string | null): RecipeTab {
  return recipeTabs.find((tab) => tab.id === value)?.id ?? 'deployment';
}

export function recipeTabHref(search: string, tab: RecipeTab) {
  const params = new URLSearchParams(search);
  if (tab === 'deployment') params.delete('tab');
  else params.set('tab', tab);
  return recipeRoute(
    params.get('model') ?? params.get('modelId') ?? '',
    params.get('id') ?? params.get('recipeId') ?? '',
    params.toString(),
  );
}

export function catalogReturnTo(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith('/models') ||
    value.includes('\\') ||
    Array.from(value).some((char) => char.charCodeAt(0) <= 32)
  )
    return '/models';
  const url = new URL(value, 'https://catalog.invalid');
  if (url.origin !== 'https://catalog.invalid' || url.pathname !== '/models')
    return '/models';
  url.searchParams.delete('benchmark');
  return url.pathname + url.search;
}

export function reportHref(
  r: Recipe,
  _commit: string,
  _returnTo?: string,
  reportName?: string,
) {
  return reportRoute(r.model.name, r.variant.id, '', undefined, reportName);
}

function reportRoute(
  modelId: string,
  recipeId: string,
  dataVersion: string,
  returnTo?: string,
  reportName?: string,
) {
  const params = new URLSearchParams({ modelId, recipeId });
  if (dataVersion) params.set('dataVersion', dataVersion);
  if (returnTo) params.set('returnTo', catalogReturnTo(returnTo));
  if (reportName) params.set('report', reportName);
  return recipeTabHref(params.toString(), 'performance');
}

export function legacyCatalogReportHref(search: string): string | null {
  const params = new URLSearchParams(search);
  if (!params.has('benchmark')) return null;
  const key = params.get('benchmark') ?? '';
  const separator = key.indexOf('/');
  return reportRoute(
    separator < 0 ? key : key.slice(0, separator),
    separator < 0 ? '' : key.slice(separator + 1),
    params.get('dataVersion') ?? '',
    catalogReturnTo('/models' + search),
  );
}

export function legacyRecipeReportHref(search: string, hash: string) {
  if (hash !== '#benchmark') return null;
  return recipeTabHref(search, 'performance');
}
