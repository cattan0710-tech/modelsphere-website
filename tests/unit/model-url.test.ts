import { describe, expect, it } from 'vitest';
import { baseline, modelHref } from '../../src/features/catalog/data';
import {
  modelNavigationState,
  modelRoute,
  readModelNavigationState,
} from '../../src/features/catalog/routes';

describe('shareable model addresses and private navigation context', () => {
  it('keeps model identity in a stable short address without exposing list filters', () => {
    const model = baseline.models[0];
    const href = modelHref(
      model,
      baseline.commit,
      '/models?q=private-search&vendor=ascend&page=2',
    );
    expect(href).toBe(`/model?id=${model.name}`);
    expect(href).not.toContain('private-search');
    expect(href).not.toContain(baseline.commit);
    expect(modelRoute(model.name, baseline.commit)).toBe(
      `${href}&dataVersion=${baseline.commit}`,
    );
  });

  it('round trips the list and pinned snapshot separately from a shareable URL', () => {
    const returnTo = '/models?vendor=ascend&layout=table&page=2';
    const state = modelNavigationState(baseline.commit, returnTo);
    expect(readModelNavigationState(JSON.parse(JSON.stringify(state)))).toEqual(
      {
        catalogDataVersion: baseline.commit,
        catalogReturnTo: returnTo,
      },
    );
    expect(readModelNavigationState(undefined)).toEqual({
      catalogDataVersion: '',
      catalogReturnTo: '/models',
    });
  });

  it('rejects unsafe return locations and malformed history snapshot values', () => {
    for (const returnTo of ['https://evil.test/models', '//evil.test/models']) {
      expect(
        readModelNavigationState({
          catalogReturnTo: returnTo,
          catalogDataVersion: 'master',
        }),
      ).toEqual({ catalogReturnTo: '/models', catalogDataVersion: '' });
    }
    expect(readModelNavigationState({ catalogReturnTo: 42 })).toEqual({
      catalogDataVersion: '',
      catalogReturnTo: '/models',
    });
  });
});
