import { CountryAuthorityDto } from '@core';

export enum ProviderMethodBoundedState {
  BOUNDED = 'bounded',
  MIXED = 'mixed',
  NOT_BOUNDED = 'not_bounded'
}

export interface ProviderMethodBoundedDto {
  methodName: string;
  methodCode: string;
  state: ProviderMethodBoundedState;
  boundedCA: CountryAuthorityDto[];
}
