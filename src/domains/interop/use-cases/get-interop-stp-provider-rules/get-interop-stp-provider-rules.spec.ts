import { GetInteropStpRulesParams, StpProviderRuleInterop } from '@domains/interop';
import { StpProviderRuleRepository, StpRuleRepository } from '@infra';
import { stpProviderRuleMockIsEnabled, stpProviderRuleMockIsEnabledFalse, stpRuleMock } from '@test/fixtures';
import { GetInteropStpProviderRules, GetInteropStpRulesOptions } from '@domains/interop/use-cases';

describe('GetInteropStpProviderRules', () => {
  it('should return list of StpProviderRules when isEnabled true', async () => {
    const params: GetInteropStpRulesParams = {
      authority: 'FSCM',
      providerCode: 'stripe',
    };

    const result: StpProviderRuleInterop[] = [
      {
        id: stpRuleMock[0].id,
        key: stpRuleMock[0].key,
        orderId: stpRuleMock[0].order,
        description: stpRuleMock[0].description,
        allowType: null,
        enforceAuto: null,
        value: null,
        isEnabled: stpProviderRuleMockIsEnabled.isEnabled,
        valueType: null,
      },
    ];

    const dependencies: GetInteropStpRulesOptions = {
      stpProviderRuleRepository: mock<StpProviderRuleRepository>({
        findOneByProviderAndAuthority: jest.fn().mockReturnValue(stpProviderRuleMockIsEnabled),
      }),
      stpRuleRepository: mock<StpRuleRepository>({ findAll: jest.fn().mockReturnValue(stpRuleMock) }),
    };

    const service = new GetInteropStpProviderRules(dependencies);
    const rules = await service.execute(params);

    expect(rules).toStrictEqual(result);
  });

  it('should return empty array when isEnabled false and data is null', async () => {
    const params: GetInteropStpRulesParams = {
      authority: 'FSCM',
      providerCode: 'stripe',
    };

    const dependencies: GetInteropStpRulesOptions = {
      stpProviderRuleRepository: mock<StpProviderRuleRepository>({
        findOneByProviderAndAuthority: jest.fn().mockReturnValue(stpProviderRuleMockIsEnabledFalse),
      }),
      stpRuleRepository: mock<StpRuleRepository>({ findAll: jest.fn().mockReturnValue(stpRuleMock) }),
    };

    const service = new GetInteropStpProviderRules(dependencies);
    const rules = await service.execute(params);

    expect(rules).toStrictEqual([]);
  });
});
