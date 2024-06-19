import { StpProviderRuleEntity, StpRuleEntity } from '@core';
import { StpProviderRulesWithCaDto } from '@domains/providers/types';

import { StpProviderRulesMapper } from './stp-provider-rules-mapper';

describe('StpProviderRulesMapper', () => {
  describe('#mapToStpRulesWithCA', () => {
    it('Should return empty array', () => {
      const stpRules: StpProviderRuleEntity[] = [];

      expect(StpProviderRulesMapper.mapToStpRulesWithCA(stpRules)).toStrictEqual([]);
    });

    it('Should group into one group across three authorities with the same data', () => {
      const data = JSON.stringify([
        { key: 'test', isEnabled: true, type: '1', value: '2' },
        { key: 'test2', isEnabled: true, type: '3', value: '4' },
        { key: 'test3', isEnabled: true, type: '5', value: '6' },
      ]);

      const stpRules = mock<StpProviderRuleEntity[]>([
        { providerCode: 'skrill', authorityFullCode: 'CYSEC', isEnabled: true, countryIso2: null, data },
        { providerCode: 'skrill', authorityFullCode: 'GM', isEnabled: true, countryIso2: null, data },
        { providerCode: 'skrill', authorityFullCode: 'FSCM', isEnabled: true, countryIso2: null, data },
        { providerCode: 'skrill', authorityFullCode: 'KNN', isEnabled: true, countryIso2: null, data },
      ]);

      expect(StpProviderRulesMapper.mapToStpRulesWithCA(stpRules)).toStrictEqual([
        {
          isEnabled: true,
          countriesAuthorities: [{ authority: 'CYSEC' }, { authority: 'GM' }, { authority: 'FSCM' }, { authority: 'KNN' }],
          stpRules: JSON.parse(data),
        },
      ] as StpProviderRulesWithCaDto[]);
    });

    it('Should group into two groups with the same data', () => {
      const data1RAW = JSON.stringify([{ key: 'test', isEnabled: true, type: 'number', value: '2' }]);
      const data2RAW = JSON.stringify([{ key: 'test2', isEnabled: true, type: 'number', value: '4' }]);

      const stpRules = mock<StpProviderRuleEntity[]>([
        { providerCode: 'skrill', authorityFullCode: 'CYSEC', isEnabled: true, countryIso2: null, data: data1RAW },
        { providerCode: 'skrill', authorityFullCode: 'CYSEC', isEnabled: true, countryIso2: null, data: data2RAW },
        { providerCode: 'skrill', authorityFullCode: 'GM', isEnabled: true, countryIso2: null, data: data1RAW },
        { providerCode: 'skrill', authorityFullCode: 'GM', isEnabled: true, countryIso2: null, data: data2RAW },
      ]);

      const data = StpProviderRulesMapper.mapToStpRulesWithCA(stpRules);

      expect(data).toStrictEqual([
        {
          isEnabled: true,
          countriesAuthorities: [{ authority: 'CYSEC' }, { authority: 'GM' }],
          stpRules: [
            { key: 'test',  type: 'number', value: '2', isEnabled: true },
          ],
        },
        {
          isEnabled: true,
          countriesAuthorities: [{ authority: 'CYSEC' }, { authority: 'GM' }],
          stpRules: [
            { key: 'test2',  type: 'number', value: '4', isEnabled: true },
          ],
        },
      ] as StpProviderRulesWithCaDto[]);
    });
  });

  describe('#mapStpRulesWithCAToEntities', () => {
    it('Should map to entities', () => {
      const providerCode = 'bankwire';
      const stpRules = mock<StpRuleEntity[]>([
        { key: 'test', order: 1 },
        { key: 'test2', order: 2 },
        { key: 'test3', order: 2 },
      ]);
      const stpRules1 = [
        { key: 'test', isEnabled: true, type: 'number', value: '2' },
        { key: 'test2', isEnabled: true, type: 'number', value: '4' },
        { key: 'test3', isEnabled: true, type: 'number', value: '6' },
      ];
      const stpRules2 = [
        { key: 'test', isEnabled: true, type: 'number', value: '1' },
        { key: 'test2', isEnabled: true, type: 'number', value: '3' },
        { key: 'test3', isEnabled: true, type: 'number', value: '5' },
      ];
      const stpRules1RAW = JSON.stringify(stpRules1);
      const stpRules2RAW = JSON.stringify(stpRules2);
      const stpRulesWithCA = [
        {
          isEnabled: true,
          countriesAuthorities: [{ authority: 'CYSEC' }, { authority: 'GM' }, { authority: 'FSCM' }, { authority: 'KNN' }],
          stpRules: stpRules1,
        },
        {
          isEnabled: false,
          countriesAuthorities: [{ authority: 'CYSEC' }, { authority: 'FSCM' }],
          stpRules: stpRules2,
        },
      ] as StpProviderRulesWithCaDto[];

      expect(StpProviderRulesMapper.mapStpRulesWithCAToEntities(providerCode, stpRules, stpRulesWithCA)).toStrictEqual([
        { providerCode, data: stpRules1RAW, authorityFullCode: 'CYSEC', countryIso2: null, isEnabled: true },
        { providerCode, data: stpRules1RAW, authorityFullCode: 'GM', countryIso2: null, isEnabled: true },
        { providerCode, data: stpRules1RAW, authorityFullCode: 'FSCM', countryIso2: null, isEnabled: true },
        { providerCode, data: stpRules1RAW, authorityFullCode: 'KNN', countryIso2: null, isEnabled: true },
        { providerCode, data: stpRules2RAW, authorityFullCode: 'CYSEC', countryIso2: null, isEnabled: false },
        { providerCode, data: stpRules2RAW, authorityFullCode: 'FSCM', countryIso2: null, isEnabled: false },
      ] as StpProviderRuleEntity[]);
    });
  });
});
