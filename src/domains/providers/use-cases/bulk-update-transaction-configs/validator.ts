import { NotFoundError } from '@internal/errors-library';
import { CurrencyEntity } from '@core/contracts/infrastructure/entities';
import { MaxAllowedCurrenciesExceededError } from '@domains/providers/errors';

import { CurrencyConfigUpdateDto } from './types';

interface ValidateCurrenciesParams {
  currencyConfigs: CurrencyConfigUpdateDto[];
  currencies: CurrencyEntity[];
}

export class Validator {
  private static readonly currenciesMaxLimit = 10;

  public static validateCurrencies(params: ValidateCurrenciesParams): void | never {
    const currenciesSet = new Set<string>(params.currencies.map(c => c.iso3.toLowerCase()));
    const currenciesToUpdate = new Set<string>();

    for (const cc of params.currencyConfigs) {
      if (!currenciesSet.has(cc.currency.toLowerCase())) {
        throw new NotFoundError(`Unknown currency`, { id: cc.currency });
      }

      currenciesToUpdate.add(cc.currency);
    }

    if (currenciesToUpdate.size > this.currenciesMaxLimit) {
      throw new MaxAllowedCurrenciesExceededError(currenciesToUpdate.size, this.currenciesMaxLimit);
    }
  }
}
