import { Cache, UseCase } from '@core';
import { StpRuleRepository } from '@infra';
import { StpRuleDto } from '@core/contracts/dtos/stp-rule-dto';

export interface GetStpRulesOptions {
  stpRuleRepository: StpRuleRepository;
}

export class GetStpRules extends UseCase<unknown, StpRuleDto[]> {
  private readonly stpRuleRepository: StpRuleRepository;

  constructor(options: GetStpRulesOptions) {
    super(options);
    this.stpRuleRepository = options.stpRuleRepository;
  }

  @Cache()
  public async execute(): Promise<StpRuleDto[]> {
    const stpRules = await this.stpRuleRepository.findAll({ order: ['order'] });

    return stpRules.map(r => ({
      key: r.key,
      description: r.description,
      order: r.order,
      data: r.data ? JSON.parse(r.data) : null,
    }));
  }
}
