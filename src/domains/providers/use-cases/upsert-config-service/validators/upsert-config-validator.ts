import { ConflictError } from '@internal/errors-library';
import { CountryAuthorityMethodUpsertDto, UpsertConfigServiceParams } from '@domains/providers/types/contracts';
import { MaxAllowedMethodsExceededError } from '@domains/providers/errors';
import { objectToKey } from '@utils';

export class UpsertConfigValidator {
  /**
   * Limiting the data sent to prevent excessive volume.
   * The front-end is constrained by a maximum of CA * MAX 3 methods.
   * CP-855 Adjusts the maximum allowed length for country authority methods to 4000.
   */
  private static readonly maxAllowedCountryAuthorityMethodsLength: number = 4000;

  public static validate(payload: UpsertConfigServiceParams): void {
    this.validateCountryAuthorityMethods(payload.countryAuthorityMethods);
  }

  private static validateCountryAuthorityMethods(countryAuthorityMethods: CountryAuthorityMethodUpsertDto[]): void | never {
    const map = new Map<string, CountryAuthorityMethodUpsertDto>();

    for (const cam of countryAuthorityMethods) {
      const key = objectToKey(cam);

      if (map.has(key)) {
        throw new ConflictError('`countryAuthorityMethods` contains duplicates', { id: key });
      }

      map.set(key, cam);
    }

    if (map.size >= this.maxAllowedCountryAuthorityMethodsLength) {
      throw new MaxAllowedMethodsExceededError();
    }
  }
}
