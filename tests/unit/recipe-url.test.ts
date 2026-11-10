import { describe, expect, it } from 'vitest';
import {
  baseline,
  detailHref,
  recipesOf,
} from '../../src/features/catalog/data';
import {
  recipeRoute,
  recipeTabHref,
  reportHref,
} from '../../src/features/catalog/routes';

const recipe = recipesOf(baseline).find(
  (r) => r.key === 'glm5.3/sglang-tp4-b300-optimized',
)!;
const href = '/recipe?model=glm5.3&id=sglang-tp4-b300-optimized';

describe('shareable recipe addresses', () => {
  it('omits the catalog snapshot and list filters from normal deployment links', () => {
    expect(
      detailHref(
        recipe,
        baseline.commit,
        undefined,
        '/models?q=private&layout=table',
      ),
    ).toBe(href);
    expect(detailHref(recipe, baseline.commit, '1.0.4')).toBe(
      href + '&version=1.0.4',
    );
  });

  it('keeps model identity because recipe identifiers repeat across models', () => {
    const repeated = recipesOf(baseline).filter(
      (r) => r.variant.id === 'sglang-tp8-h100-optimized',
    );
    expect(repeated.length).toBeGreaterThan(1);
    expect(
      new Set(repeated.map((r) => detailHref(r, baseline.commit))).size,
    ).toBe(repeated.length);
  });

  it('retains selected reports and configuration versions across tabs', () => {
    const report = reportHref(
      recipe,
      baseline.commit,
      '/models?q=private',
      'glm5.3-1.0.3-b300-report.html',
    );
    const url = new URL(report, 'https://site.test');
    expect(
      url.pathname +
        '?model=' +
        url.searchParams.get('model') +
        '&id=' +
        url.searchParams.get('id'),
    ).toBe(href);
    expect(url.searchParams.get('report')).toBe(
      'glm5.3-1.0.3-b300-report.html',
    );
    expect(url.searchParams.get('tab')).toBe('performance');
    expect(url.searchParams.has('dataVersion')).toBe(false);
    expect(url.searchParams.has('returnTo')).toBe(false);
    const historical = recipeRoute(
      recipe.model.name,
      recipe.variant.id,
      'version=1.0.4&tab=performance&report=selected.html',
    );
    expect(
      recipeTabHref(
        new URL(historical, 'https://site.test').search,
        'deployment',
      ),
    ).toBe(href + '&version=1.0.4&report=selected.html');
  });
});
