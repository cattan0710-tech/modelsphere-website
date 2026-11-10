import React from 'react';
import { translate } from '@docusaurus/Translate';
import CatalogSelect from './CatalogSelect';

export default function CatalogSort({
  value,
  onValueChange,
  context = 'recipes',
}: {
  value: string;
  onValueChange: (value: string) => void;
  context?: 'models' | 'recipes' | 'model-recipes';
}) {
  return (
    <CatalogSelect
      label={translate({ id: 'site.1ce6b1d7c95c', message: '排序方式' })}
      value={value}
      onValueChange={onValueChange}
      options={[
        {
          value: 'improvement-desc',
          label:
            context === 'models'
              ? translate({
                  id: 'site.f7e6d40ff9f5',
                  message: '按调优配方最佳提升排序',
                })
              : translate({
                  id: 'site.26ba23cf9e57',
                  message: '按吞吐量提升排序',
                }),
        },
        {
          value: 'name-asc',
          label:
            context === 'model-recipes'
              ? translate({
                  id: 'catalog.recipeNameAsc',
                  message: '按配方名称 A–Z',
                })
              : translate({
                  id: 'site.e273b1d2eca6',
                  message: '按模型名称 A–Z',
                }),
        },
        {
          value: 'name-desc',
          label:
            context === 'model-recipes'
              ? translate({
                  id: 'catalog.recipeNameDesc',
                  message: '按配方名称 Z–A',
                })
              : translate({
                  id: 'site.1322e7738e4a',
                  message: '按模型名称 Z–A',
                }),
        },
        {
          value: 'updated-desc',
          label: translate({
            id: 'site.6592019eaa05',
            message: '按配方发布日期（由新到旧）',
          }),
        },
      ]}
    />
  );
}
