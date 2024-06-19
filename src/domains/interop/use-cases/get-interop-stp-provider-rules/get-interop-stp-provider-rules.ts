import { UseCase } from '@core';
import { GetInteropStpRulesParams, StpProviderRuleInterop } from '@domains/interop';
import { StpProviderRuleRepository } from '@infra';
import { StpProviderRuleMapper } from '@domains/interop/mappers';
import { StpRuleRepository } from '@infra/repos/stp-rule-repository';

export interface GetInteropStpRulesOptions {
  stpProviderRuleRepository: StpProviderRuleRepository;
  stpRuleRepository: StpRuleRepository;
}

export class GetInteropStpProviderRules extends UseCase<GetInteropStpRulesParams, StpProviderRuleInterop[]> {
  private readonly stpProviderRuleRepository: StpProviderRuleRepository;
  private readonly stpRuleRepository: StpRuleRepository;

  constructor(options: GetInteropStpRulesOptions) {
    super(options);
    this.stpProviderRuleRepository = options.stpProviderRuleRepository;
    this.stpRuleRepository = options.stpRuleRepository;
  }

  public async execute({ providerCode, authority }: GetInteropStpRulesParams): Promise<StpProviderRuleInterop[]> {
    const [stpRules, stpProviderRule] = await Promise.all([
      this.stpRuleRepository.findAll(),
      this.stpProviderRuleRepository.findOneByProviderAndAuthority(providerCode, authority),
    ]);

    if (!stpProviderRule) {
      return [];
    }

    const stpProviderRuleDtos = StpProviderRuleMapper.getDtos(stpProviderRule);

    return stpProviderRuleDtos
      .filter(r => r.isEnabled)
      .map(r => StpProviderRuleMapper.getStpProviderRuleInterop(r, stpRules))
      .sort((a, b) => a.orderId - b.orderId);
  }
}
