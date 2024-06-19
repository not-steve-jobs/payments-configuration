import { AddCurrency, AddCurrencyOptions } from './add-currency';
import { CurrencyDto } from './types';

describe('AddCurrency', () => {
  it('Should throw ERR_CONFLICT if currency already exist', async () => {
    const currencyDto: CurrencyDto = { iso3: 'TTT' };
    const options = mock<AddCurrencyOptions>({
      currencyRepository: {
        findOne: jest.fn().mockResolvedValue(currencyDto),
      },
    });

    const service = new AddCurrency(options);

    await expect(service.execute(currencyDto)).rejects.toThrow('Currency already exist');
  });

  it('Should create new currency', async () => {
    const currencyDto: CurrencyDto = { iso3: 'TTT' };
    const options = mock<AddCurrencyOptions>({
      currencyRepository: {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(currencyDto),
      },
    });

    const service = new AddCurrency(options);

    await expect(service.execute(currencyDto)).resolves.toStrictEqual(currencyDto);
  });
});
