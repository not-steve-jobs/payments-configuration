import { Cache, UseCase } from '@core';
import { ProviderRepository, StpProviderRuleRepository } from '@infra/repos';
import { StpProviderRulesMapper } from '@domains/providers/mappers';
import { StpProviderRulesWithCaDto } from '@domains/providers/types';

export interface GetStpProviderRulesOptions {
  stpProviderRuleRepository: StpProviderRuleRepository;
  providerRepository: ProviderRepository;
}

export class GetStpProviderRules extends UseCase<string, StpProviderRulesWithCaDto[]> {
  private readonly stpProviderRuleRepository: StpProviderRuleRepository;
  private readonly providerRepository: ProviderRepository;

  constructor(options: GetStpProviderRulesOptions) {
    super(options);
    this.stpProviderRuleRepository = options.stpProviderRuleRepository;
    this.providerRepository = options.providerRepository;
  }

  @Cache()
  public async execute(providerCode: string): Promise<StpProviderRulesWithCaDto[]> {
    await this.providerRepository.findOneOrThrow({ code: providerCode });

    const stpProviderRules = await this.stpProviderRuleRepository.findAll({ params: { providerCode } });

    return StpProviderRulesMapper.mapToStpRulesWithCA(stpProviderRules);
  }
}
