import { CountryAuthorityDto, MethodEntity } from '@core';
import { ProviderMethodBoundedDto, ProviderMethodBoundedState } from '@domains/providers/types';

export interface CreateDtoOptions {
  methods: MethodEntity[];
  methodCodeToBoundedCAMap: Map<string, Map<string, CountryAuthorityDto>>;
  countryAuthorityIds: string[];
}

export class ProviderMethodBoundedFactory {
  private static readonly stateToOrder = {
    [ProviderMethodBoundedState.BOUNDED]: 0,
    [ProviderMethodBoundedState.MIXED]: 1,
    [ProviderMethodBoundedState.NOT_BOUNDED]: 2,
  };

  private static buildInitialNotBoundedState(methods: MethodEntity[]): Record<string, ProviderMethodBoundedDto> {
    return methods.reduce((acc, method) => {
      acc[method.code] = {
        methodCode: method.code,
        methodName: method.name,
        state: ProviderMethodBoundedState.NOT_BOUNDED,
        boundedCA: [],
      };
      return acc;
    }, {} as Record<string, ProviderMethodBoundedDto>);
  }

  private static getState(boundedCA: Map<string, CountryAuthorityDto>, countryAuthorityIds: string[]): ProviderMethodBoundedState {
    if (!countryAuthorityIds.length) {
      return ProviderMethodBoundedState.BOUNDED;
    }

    const isBounded = countryAuthorityIds.every(id => boundedCA.has(id));
    if (isBounded) {
      return ProviderMethodBoundedState.BOUNDED;
    }

    const isMixed = countryAuthorityIds.some(id => boundedCA.has(id));
    if (isMixed) {
      return ProviderMethodBoundedState.MIXED;
    }

    return ProviderMethodBoundedState.NOT_BOUNDED;
  }

  public static createDto(options: CreateDtoOptions): ProviderMethodBoundedDto[] {
    const { methods, methodCodeToBoundedCAMap, countryAuthorityIds } = options;

    const initialNotBoundedState = this.buildInitialNotBoundedState(methods);

    const response = Object.values(Array.from(methodCodeToBoundedCAMap.entries()).reduce((acc, [methodCode, boundedCA]) => {
      const state = this.getState(boundedCA, countryAuthorityIds);
      acc[methodCode].state = state;

      if (state !== ProviderMethodBoundedState.NOT_BOUNDED) {
        acc[methodCode].boundedCA = [...(boundedCA.values())];
      }

      return acc;
    }, initialNotBoundedState));

    return response.sort((a, b) => {
      const stateOrder = this.stateToOrder[a.state] - this.stateToOrder[b.state];
      return stateOrder ? stateOrder : a.methodCode < b.methodCode ? -1 : 1;
    });
  }
}
