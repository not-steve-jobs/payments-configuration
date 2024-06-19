export interface CountriesAuthoritiesDto {
  authority: string;
}

export enum StpRuleType {
  NUMBER = 'number',
  LIST = 'list'
}

export interface StpRuleDto {
  key: string;
  type: StpRuleType;
  value: string;
  isEnabled: boolean;
}

export interface StpProviderRulesWithCaDto {
  countriesAuthorities: CountriesAuthoritiesDto[];
  stpRules: StpRuleDto[];
  isEnabled: boolean;
}


