import { StpProviderRulesWithCaDto } from '@domains/providers/types';

export interface UpdateStpProviderRulesParams {
  providerCode: string;
  stpProviderRules: StpProviderRulesWithCaDto[];
}
