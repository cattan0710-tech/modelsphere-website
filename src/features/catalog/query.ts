import {
  hardware,
  isDefault,
  role,
  recipesOf,
  summarizeModel,
  topology,
  type Catalog,
  type Recipe,
} from './data';
import { hardwareVendor, variantVendors } from './hardware';
export interface Query {
  q: string;
  family: string;
  engine: string;
  role: string;
  vendor: string;
  hardware: string[];
  topology: string;
  view: string;
  layout: string;
  sort: string;
  page: number;
  dataVersion: string;
}
export const PAGE_SIZE = 12;
const sortOptions = [
  'improvement-desc',
  'name-asc',
  'name-desc',
  'updated-desc',
];
export function parseSort(value: string | null) {
  return value && sortOptions.includes(value) ? value : 'improvement-desc';
}
export const initialQuery: Query = {
  q: '',
  family: '',
  engine: '',
  role: '',
  vendor: '',
  hardware: [],
  topology: '',
  view: 'recipes',
  layout: 'cards',
  sort: 'improvement-desc',
  page: 1,
  dataVersion: '',
};
export function activeCatalog(c: Catalog): Catalog {
  const models = c.models
    .filter((model) => !model.deprecated)
    .map((model) => ({
      ...model,
      variants: model.variants.filter((variant) => !variant.deprecated),
    }));
  return { ...c, count: models.length, models };
}
export function facets(c: Catalog, vendor = '') {
  c = activeCatalog(c);
  const rs = recipesOf(c);
  return {
    family: Array.from(
      new Set(c.models.flatMap((m) => (m.family ? [m.family] : []))),
    ).sort(),
    engine: Array.from(new Set(rs.map((r) => r.variant.engine))).sort(),
    vendor: Array.from(
      new Set(rs.flatMap((r) => variantVendors(r.variant))),
    ).sort(),
    hardware: Array.from(
      new Set(
        rs.flatMap((r) =>
          r.variant.requires.gpuProduct.filter(
            (product) =>
              !vendor ||
              hardwareVendor(product, r.variant.requires.vendor) === vendor,
          ),
        ),
      ),
    ).sort(),
  };
}
export function parseQuery(search: string, c: Catalog): Query {
  const p = new URLSearchParams(search),
    f = facets(c);
  const allowed = (key: string, values: string[], fallback = '') =>
    values.includes(p.get(key) ?? '') ? p.get(key)! : fallback;
  const rawPage = p.get('page') ?? '1';
  const vendor = allowed('vendor', f.vendor);
  const products = facets(c, vendor).hardware;
  return {
    q: Array.from(
      new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }).segment(
        (p.get('q') ?? '').trim(),
      ),
    )
      .slice(0, 100)
      .map((x) => x.segment)
      .join(''),
    family: allowed('family', f.family),
    engine: allowed('engine', f.engine),
    role: allowed('role', ['optimized', 'baseline', 'default', 'recipe']),
    vendor,
    hardware: Array.from(
      new Set(p.getAll('hardware').filter((x) => products.includes(x))),
    ),
    topology: allowed('topology', ['single-node', 'lws', 'pd']),
    view: allowed('view', ['models', 'recipes'], 'recipes'),
    layout: allowed('layout', ['cards', 'table'], 'cards'),
    sort: parseSort(p.get('sort')),
    page:
      /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(+rawPage)
        ? +rawPage
        : 1,
    dataVersion: p.get('dataVersion') ?? '',
  };
}
export function queryHref(q: Query) {
  const p = new URLSearchParams();
  for (const k of ['q', 'family', 'engine', 'role', 'vendor'] as const)
    if (q[k]) p.set(k, q[k]);
  q.hardware.forEach((x) => p.append('hardware', x));
  for (const k of [
    'topology',
    'view',
    'layout',
    'sort',
    'page',
    'dataVersion',
  ] as const)
    if (q[k] && q[k] !== initialQuery[k]) p.set(k, String(q[k]));
  return '/models' + (p.size ? '?' + p.toString() : '');
}
export function queryRecipes(c: Catalog, q: Query) {
  const list = recipesOf(activeCatalog(c))
    .filter((r) => {
      const m = r.model,
        v = r.variant;
      const text = [
        m.name,
        m.displayName,
        m.description,
        m.family,
        m.source?.hf,
        ...m.tags,
        v.id,
        v.description,
        v.engine,
        v.image?.repository,
        v.image?.tag,
        ...v.requires.gpuProduct,
        ...hardware(v),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return (
        (!q.q || text.includes(q.q.toLowerCase())) &&
        (!q.family || m.family === q.family) &&
        (!q.engine || v.engine === q.engine) &&
        (!q.role ||
          (q.role === 'default' ? isDefault(r) : role(r) === q.role)) &&
        (!q.topology || topology(v) === q.topology) &&
        (!q.vendor || variantVendors(v).includes(q.vendor)) &&
        (!q.hardware.length ||
          q.hardware.some(
            (x) =>
              v.requires.gpuProduct.includes(x) &&
              (!q.vendor || hardwareVendor(x, v.requires.vendor) === q.vendor),
          ))
      );
    })
    .sort((a, b) => compare(a, b, q.sort));
  return paginate(list, q.page);
}
export function queryModels(c: Catalog, q: Query) {
  c = activeCatalog(c);
  const matching = new Set(queryRecipes(c, q).all.map((r) => r.model.name));
  const entries = c.models
    .filter((model) => {
      if (matching.has(model.name)) return true;
      if (
        model.variants.length ||
        q.engine ||
        q.role ||
        q.vendor ||
        q.hardware.length ||
        q.topology
      )
        return false;
      const text = [
        model.name,
        model.displayName,
        model.description,
        model.family,
        model.source?.hf,
        ...model.tags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return (
        (!q.q || text.includes(q.q.toLowerCase())) &&
        (!q.family || model.family === q.family)
      );
    })
    .map(summarizeModel)
    .sort((a, b) => {
      if (q.sort === 'improvement-desc') {
        const missing = Number(a.best == null) - Number(b.best == null);
        if (missing) return missing;
        if (a.best && b.best && a.best.gain !== b.best.gain)
          return b.best.gain - a.best.gain;
      }
      if (q.sort === 'updated-desc') {
        const latest = (summary: typeof a) =>
          summary.recipes
            .flatMap((r) =>
              r.variant.releaseDate ? [r.variant.releaseDate] : [],
            )
            .sort()
            .at(-1) ?? '';
        const date = latest(b).localeCompare(latest(a));
        if (date) return date;
      }
      return (
        (q.sort === 'name-desc' ? -1 : 1) *
        a.model.name.localeCompare(b.model.name)
      );
    });
  return paginate(entries, q.page);
}
function paginate<T>(entries: T[], requestedPage: number) {
  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE)),
    page = Math.min(requestedPage, pages);
  return {
    all: entries,
    total: entries.length,
    page,
    pages,
    items: entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}
export function compare(a: Recipe, b: Recipe, sort: string) {
  // These are explicitly quoted source records, not verified comparable throughput measurements.
  if (sort === 'improvement-desc') {
    const missing = Number(a.quotedGain == null) - Number(b.quotedGain == null);
    if (missing) return missing;
    if (
      a.quotedGain != null &&
      b.quotedGain != null &&
      a.quotedGain !== b.quotedGain
    )
      return b.quotedGain - a.quotedGain;
  }
  if (sort === 'updated-desc') {
    const missing =
      Number(!a.variant.releaseDate) - Number(!b.variant.releaseDate);
    if (missing) return missing;
    const d = (b.variant.releaseDate ?? '').localeCompare(
      a.variant.releaseDate ?? '',
    );
    if (d) return d;
  }
  const name = a.model.name.localeCompare(b.model.name);
  return (sort === 'name-desc' ? -1 : 1) * (name || a.key.localeCompare(b.key));
}
