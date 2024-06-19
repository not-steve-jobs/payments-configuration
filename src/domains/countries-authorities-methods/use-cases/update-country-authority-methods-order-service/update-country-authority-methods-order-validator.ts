import { ConflictError, NotFoundError } from '@internal/errors-library';
import { CountryAuthorityMethodWithCodeDto } from '@core';

export class UpdateCountryAuthorityMethodsOrderValidator {
  public static validateMethodCodes(codes: string[]): void | never {
    if (new Set(codes).size !== codes.length) {
      throw new ConflictError('Method codes contain duplicates', { id: codes });
    }
  }

  public static validateCountryAuthorityMethods(
    entityList: CountryAuthorityMethodWithCodeDto[],
    methodCodes: string[]
  ): void | never {
    const entityCodes = entityList.map(e => e.code.toLowerCase());

    for (const ec of entityCodes) {
      if (!methodCodes.find(m => ec === m)) {
        throw new ConflictError(`Method "${ec}" is missed in request`, { id: ec });
      }
    }

    for (const m of methodCodes) {
      if (!entityCodes.find(c => c === m)) {
        throw new NotFoundError(`Method "${m}" not found in this Country-Authority`, { id: m });
      }
    }
  }
}
