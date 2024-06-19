import { CredentialsOverlapError, CredentialsOverlapErrorCode, CredentialsOverlapErrorParams } from '@domains/providers/errors';
import { CredentialDetails, CredentialsData, CredentialsDataParameters } from '@domains/providers/types';
import { CountryAuthorityValidator } from '@domains/providers/validators';
import { CountryAuthorityDto, CountryAuthorityEntity } from '@core';

interface CredentialsValidatorParams {
  countriesAuthoritiesBounded: CountryAuthorityEntity[];
}

export class CredentialsValidator {
  private static readonly allVariants = 'all';

  public static validate(credentialsDataList: CredentialsData[], params: CredentialsValidatorParams): void | never {
    this.validateCredentialsOverlap(credentialsDataList);
    this.validateCountriesAuthorities(credentialsDataList, params.countriesAuthoritiesBounded);
  };

  private static validateCountriesAuthorities(
    credentialsDataList: CredentialsData[],
    countriesAuthoritiesBounded: CountryAuthorityEntity[]
  ): void | never {
    const countriesAuthorities = Array.from(credentialsDataList.reduce((acc, next) => {
      const countryAuthorityDto = { country: next.parameters.country || '', authority: next.parameters.authority || '' };

      acc.set(`${countryAuthorityDto.country}:${countryAuthorityDto.authority}`.toUpperCase(), countryAuthorityDto);
      return acc;
    }, new Map<string, CountryAuthorityDto>).values());

    CountryAuthorityValidator.validate({ countriesAuthorities, countriesAuthoritiesBounded });
  }

  private static validateCredentialsOverlap(credentialsDataList: CredentialsData[]): void {
    const overlap = this.findCredentialsOverlap(credentialsDataList);

    if (overlap) {
      throw new CredentialsOverlapError(overlap);
    }
  }

  private static isEmptyObject(object: Record<string, unknown>): boolean {
    return Object.keys(object).length === 0;
  }

  private static buildMatchKey(parameters: CredentialsDataParameters): string {
    const authority = parameters.authority ?? this.allVariants;
    const country = parameters.country ?? this.allVariants;
    const currency = parameters.currency ?? this.allVariants;

    return `${authority}:${country}:${currency}`;
  }

  private static findCredentialKeyOverlap(keyMap: Map<string, string>, credentialsDetails: CredentialDetails[]): CredentialsOverlapErrorParams | null {
    for (const { key, value } of credentialsDetails) {
      if (keyMap.has(key)) {
        return {
          code: CredentialsOverlapErrorCode.CREDENTIALS_OVERLAP,
          message: `Duplicate credentials found: ${key}.`,
        };
      }

      keyMap.set(key, value);
    }

    return null;
  }

  private static findParametersOverlap(overlapSet: Set<string>, parameters: CredentialsDataParameters): CredentialsOverlapErrorParams | null {
    // Shared credentials
    if (this.isEmptyObject(parameters)) {
      return null;
    }

    const key = this.buildMatchKey(parameters);
    if (overlapSet.has(key)) {
      return {
        code: CredentialsOverlapErrorCode.PARAMETERS_OVERLAP,
        message: `Duplicate rules detected for specific credentials: ${parameters.authority} * ${parameters.country} * ${parameters.currency}.`,
      };
    }

    overlapSet.add(key);

    return null;
  }

  private static findCredentialsOverlap(credentialsDataList: CredentialsData[]): CredentialsOverlapErrorParams | null {
    const overlapSet = new Set<string>();

    for (let i = 0; i < credentialsDataList.length; i++) {
      const { parameters, credentialsDetails } = credentialsDataList[i];
      const keyMap = new Map<string, string>();

      const parametersOverlap = this.findParametersOverlap(overlapSet, parameters);
      const duplicatesOverlap = this.findCredentialKeyOverlap(keyMap, credentialsDetails);

      if (parametersOverlap || duplicatesOverlap) {
        return parametersOverlap || duplicatesOverlap;
      }
    }

    return null;
  };
}
