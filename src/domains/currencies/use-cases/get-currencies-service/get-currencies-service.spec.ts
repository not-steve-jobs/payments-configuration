import { CurrencyRepository } from '@infra';
import { CurrencyEntity } from '@core';
import { GetCurrenciesService } from '@domains/currencies';

describe('GetCurrenciesService', () => {
  it('should return an array of currency codes', async () => {
    const mockCurrencyRepository = mock<CurrencyRepository>({
      findAllIso3(): Promise<CurrencyEntity[]> {
        const sampleCurrencies: CurrencyEntity[] = [
          { iso3: 'USD' },
          { iso3: 'EUR' },
          { iso3: 'GBP' },
        ];

        return Promise.resolve(sampleCurrencies);
      },
    });
    const service = new GetCurrenciesService({
      currencyRepository: mockCurrencyRepository,
    });

    const result = await service.execute();
    expect(result).toEqual(['USD', 'EUR', 'GBP']);
  });

  it('should handle empty currency list', async () => {
    const mockCurrencyRepository = mock<CurrencyRepository>({
      findAllIso3(): Promise<CurrencyEntity[]> {
        const sampleCurrencies: CurrencyEntity[] = [];
        return Promise.resolve(sampleCurrencies);
      },
    });
    mockCurrencyRepository.findAllIso3 = jest.fn().mockResolvedValue([]);

    const service = new GetCurrenciesService({
      currencyRepository: mockCurrencyRepository,
    });

    const result = await service.execute();
    expect(result).toEqual([]);
  });
});
