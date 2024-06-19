import { UpdateStpProviderRulesParams } from './types';
import { UpdateStpProviderRules, UpdateStpProviderRulesOptions } from './update-stp-provider-rules';

describe('UpdateStpProviderRules', () => {
  it('Should return empty array', async () => {
    const options = mock<UpdateStpProviderRulesOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      stpProviderRuleRepository: { updateStpRules: jest.fn().mockResolvedValue([]) },
      authorityRepository: { findAll: jest.fn().mockResolvedValue([]) },
      stpRuleRepository: { findAll: jest.fn().mockResolvedValue([]) },
      providerMethodRepository: { findCABoundedToProvider: jest.fn().mockResolvedValue([]) },
    });
    const params: UpdateStpProviderRulesParams = ({ providerCode: 'test', stpProviderRules: [] });

    const service = new UpdateStpProviderRules(options);

    expect(await service.execute(params)).toStrictEqual([]);
  });
});
