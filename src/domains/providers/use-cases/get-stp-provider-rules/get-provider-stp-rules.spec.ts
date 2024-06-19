import { GetStpProviderRules, GetStpProviderRulesOptions } from './get-stp-provider-rules';

describe('GetStpProviderRules', () => {
  it('Should return empty array', async () => {
    const options = mock<GetStpProviderRulesOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      stpProviderRuleRepository: { findAll: jest.fn().mockResolvedValue([]) },
    });

    const service = new GetStpProviderRules(options);

    expect(await service.execute('test')).toStrictEqual([]);
  });
});
