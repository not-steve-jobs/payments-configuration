import { CpTables, StpRuleEntity } from '@core/contracts/infrastructure';

import { AbstractRepository } from './abstract-repository';

export class StpRuleRepository extends AbstractRepository<StpRuleEntity> {
  protected readonly entity = CpTables.CP_STP_RULES;
}
