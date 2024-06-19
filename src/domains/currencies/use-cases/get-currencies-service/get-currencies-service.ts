import { Cache, UseCase } from '@core';
import { CurrencyRepository } from '@infra';

export interface GetCurrenciesServiceOptions {
  currencyRepository: CurrencyRepository;
}

export class GetCurrenciesService extends UseCase<unknown, string[]> {
  private readonly currencyRepository: CurrencyRepository;

  constructor(options: GetCurrenciesServiceOptions) {
    super(options);
    this.currencyRepository = options.currencyRepository;
  }

  @Cache()
  public async execute(): Promise<string[]> {
    const currencies = await this.currencyRepository.findAllIso3();

    return currencies.map(({ iso3 }) => iso3);
  }
}
