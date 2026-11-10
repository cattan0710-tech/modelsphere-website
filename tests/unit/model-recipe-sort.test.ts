import { describe, expect, it } from 'vitest';
import { baseline, recipesOf } from '../../src/features/catalog/data';
import { compare, parseSort } from '../../src/features/catalog/query';

describe('model recipe sorting', () => {
  const template = recipesOf(baseline)[0];
  const recipes = [
    { id: 'charlie', gain: null, date: undefined },
    { id: 'alpha', gain: 0, date: '2026-11-10' },
    { id: 'delta', gain: 50, date: '2026-11-01' },
    { id: 'bravo', gain: 50, date: '2026-10-01' },
  ].map(({ id, gain, date }) => ({
    ...template,
    key: `${template.model.name}/${id}`,
    variant: { ...template.variant, id, releaseDate: date },
    quotedGain: gain,
  }));
  const order = (sort: string) =>
    [...recipes].sort((a, b) => compare(a, b, sort)).map((r) => r.variant.id);

  it('reverses recipe names within the same model', () => {
    expect(order('name-asc')).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    expect(order('name-desc')).toEqual(['delta', 'charlie', 'bravo', 'alpha']);
  });

  it('puts missing gains last, keeps zero gains and resolves ties consistently', () => {
    expect(order('improvement-desc')).toEqual([
      'bravo',
      'delta',
      'alpha',
      'charlie',
    ]);
  });

  it('orders newest dates first and puts missing dates last', () => {
    expect(order('updated-desc')).toEqual([
      'alpha',
      'delta',
      'bravo',
      'charlie',
    ]);
  });

  it('uses the default for missing or unsupported URL values', () => {
    expect(parseSort(null)).toBe('improvement-desc');
    expect(parseSort('unsupported')).toBe('improvement-desc');
    for (const value of ['name-asc', 'name-desc', 'updated-desc'])
      expect(parseSort(value)).toBe(value);
  });
});
