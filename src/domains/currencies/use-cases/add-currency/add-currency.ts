import { UseCase } from '@core';
import { CurrencyRepository } from '@infra/repos';
import { ConflictError } from '@internal/errors-library';

import { CurrencyDto } from './types';

export interface AddCurrencyOptions {
  currencyRepository: CurrencyRepository;
}

export class AddCurrency extends UseCase<CurrencyDto, CurrencyDto> {
  private readonly currencyRepository: CurrencyRepository;

  constructor(options: AddCurrencyOptions) {
    super(options);
    this.currencyRepository = options.currencyRepository;
  }

  public async execute(currency: CurrencyDto): Promise<CurrencyDto> {
    await this.throwIfCurrencyExist(currency.iso3);

    return this.currencyRepository.create({ iso3: currency.iso3 });
  }

  private async throwIfCurrencyExist(iso3: string): Promise<void | never> {
    const currency = await this.currencyRepository.findOne({ iso3 });
    if (currency) {
      throw new ConflictError('Currency already exist', { id: currency.iso3 });
    }
  }
}
