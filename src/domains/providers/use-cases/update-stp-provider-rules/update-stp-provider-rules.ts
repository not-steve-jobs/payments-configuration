import { UseCase } from '@core';
import {
  AuthorityRepository,
  ProviderMethodRepository,
  ProviderRepository, StpProviderRuleRepository,
  StpRuleRepository,
} from '@infra/repos';
import { StpProviderRulesMapper } from '@domains/providers/mappers';
import { StpProviderRulesWithCaDto } from '@domains/providers/types';

import { UpdateStpProviderRulesParams } from './types';
import { UpdateStpProviderRulesValidator } from './validator';

export interface UpdateStpProviderRulesOptions {
  stpProviderRuleRepository: StpProviderRuleRepository;
  providerRepository: ProviderRepository;
  stpRuleRepository: StpRuleRepository;
  authorityRepository: AuthorityRepository;
  providerMethodRepository: ProviderMethodRepository;
}

export class UpdateStpProviderRules extends UseCase<UpdateStpProviderRulesParams, StpProviderRulesWithCaDto[]> {
  private readonly stpProviderRuleRepository: StpProviderRuleRepository;
  private readonly providerRepository: ProviderRepository;
  private readonly stpRuleRepository: StpRuleRepository;
  private readonly authorityRepository: AuthorityRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;

  constructor(options: UpdateStpProviderRulesOptions) {
    super(options);
    this.stpProviderRuleRepository = options.stpProviderRuleRepository;
    this.providerRepository = options.providerRepository;
    this.stpRuleRepository = options.stpRuleRepository;
    this.authorityRepository = options.authorityRepository;
    this.providerMethodRepository = options.providerMethodRepository;
  }

  public async execute({ providerCode, stpProviderRules }: UpdateStpProviderRulesParams): Promise<StpProviderRulesWithCaDto[]> {
    await this.providerRepository.findOneOrThrow({ code: providerCode });
    const [stpRules, authorities, countriesAuthoritiesBounded] = await Promise.all([
      this.stpRuleRepository.findAll({}),
      this.authorityRepository.findAll({}),
      this.providerMethodRepository.findCABoundedToProvider(providerCode),
    ]);

    UpdateStpProviderRulesValidator.validate({ authorities, stpRules, stpProviderRules, countriesAuthoritiesBounded });
    const rulesToUpdate = StpProviderRulesMapper.mapStpRulesWithCAToEntities(providerCode, stpRules, stpProviderRules);
    const rules = await this.stpProviderRuleRepository.updateStpRules(providerCode, rulesToUpdate);

    return StpProviderRulesMapper.mapToStpRulesWithCA(rules);
  }
}
