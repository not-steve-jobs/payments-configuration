import {
  GetBankAccounts,
  GetBankAccountsOptions,
  GetBankAccountsParams,
} from '@domains/providers';
import { NotFoundError } from '@internal/errors-library';
import { BankAccountDto } from '@core';


const generateBankAccountDto = (options: Partial<BankAccountDto> = {}): BankAccountDto =>  ({
  providerCode: 'test',
  name: 'bank',
  type: 'bankAccount',
  authorityFullCode: 'GM',
  countryIso2: 'CY',
  currencyIso3: 'EUR',
  configs: [{ key: 'key', value: 'value' }],
  ...options,
});

describe('GetBankAccounts', () => {
  it('Should throw not found error for non existing provider', async () => {
    const providerCode = 'test';
    const params: GetBankAccountsParams = { providerCode };
    const options = mock<GetBankAccountsOptions>({
      providerRepository: {
        findOneOrThrow: jest.fn().mockRejectedValue(new NotFoundError('Unknown Provider', { id: providerCode })),
      },
      bankAccountsRepository: {},
    });
    const useCase = new GetBankAccounts(options);

    await expect(useCase.execute(params)).rejects.toThrow('Unknown Provider');
    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
  });

  it('Should return empty bank accounts data', async () => {
    const providerCode = 'test';
    const params: GetBankAccountsParams = { providerCode };
    const options = mock<GetBankAccountsOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      bankAccountsRepository: {
        findAllBankAccounts: jest.fn().mockResolvedValue([]),
      },
    });
    const useCase = new GetBankAccounts(options);

    const result = await useCase.execute(params);

    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
    expect(options.bankAccountsRepository.findAllBankAccounts).toBeCalledOnceWith({ providerCode });
    expect(result).toStrictEqual({ bankAccountsData: [] });
  });


  it('Should return multiple bank accounts for the same parameters', async () => {
    const providerCode = 'test';
    const params: GetBankAccountsParams = { providerCode };
    const options = mock<GetBankAccountsOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      bankAccountsRepository: {
        findAllBankAccounts: jest.fn().mockResolvedValue([
          generateBankAccountDto({ name: 'bank1' }),
          generateBankAccountDto({ name: 'bank2' }),
        ]),
      },
    });
    const useCase = new GetBankAccounts(options);

    const result = await useCase.execute(params);

    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
    expect(options.bankAccountsRepository.findAllBankAccounts).toBeCalledOnceWith({ providerCode });
    expect(result).toStrictEqual({ bankAccountsData: [
      {
        parameters: {
          countryAuthorities: [{ authority: 'GM', country: 'CY' }],
          currencies: ['EUR'],
        },
        bankAccounts: [
          {
            name: 'bank1',
            type: 'bankAccount',
            configs: [{ key: 'key', value: 'value' } ],
          },
          {
            name: 'bank2',
            type: 'bankAccount',
            configs: [{ key: 'key', value: 'value' } ],
          },
        ],
      },
    ],
    });

  });

  it('Should return one bank account grouped by currencies', async () => {
    const providerCode = 'test';
    const params: GetBankAccountsParams = { providerCode };
    const options = mock<GetBankAccountsOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      bankAccountsRepository: {
        findAllBankAccounts: jest.fn().mockResolvedValue([
          generateBankAccountDto({ currencyIso3: 'EUR' }),
          generateBankAccountDto({ currencyIso3: 'USD' }),
        ]),
      },
    });
    const useCase = new GetBankAccounts(options);

    const result = await useCase.execute(params);

    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
    expect(options.bankAccountsRepository.findAllBankAccounts).toBeCalledOnceWith({ providerCode });
    expect(result).toStrictEqual({ bankAccountsData: [
      {
        parameters: {
          countryAuthorities: [{ authority: 'GM', country: 'CY' }],
          currencies: ['EUR', 'USD'],
        },
        bankAccounts: [
          {
            name: 'bank',
            type: 'bankAccount',
            configs: [{ key: 'key', value: 'value' }],
          },
        ],
      },
    ],
    });
  });

  it('Should return one bank account grouped by countries authorities', async () => {
    const providerCode = 'test';
    const params: GetBankAccountsParams = { providerCode };
    const options = mock<GetBankAccountsOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      bankAccountsRepository: {
        findAllBankAccounts: jest.fn().mockResolvedValue([
          generateBankAccountDto(),
          generateBankAccountDto({ countryIso2: 'BY' }),
        ]),
      },
    });
    const useCase = new GetBankAccounts(options);

    const result = await useCase.execute(params);

    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
    expect(options.bankAccountsRepository.findAllBankAccounts).toBeCalledOnceWith({ providerCode });
    expect(result).toStrictEqual({ bankAccountsData: [
      {
        parameters: {
          countryAuthorities: [
            { authority: 'GM', country: 'CY' },
            { authority: 'GM', country: 'BY' },
          ],
          currencies: ['EUR'],
        },
        bankAccounts: [
          {
            name: 'bank',
            type: 'bankAccount',
            configs: [{ key: 'key', value: 'value' }],
          },
        ],
      },
    ] });
  });

  it('Should return two bank account groups', async () => {
    const providerCode = 'test';
    const params: GetBankAccountsParams = { providerCode };
    const options = mock<GetBankAccountsOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      bankAccountsRepository: {
        findAllBankAccounts: jest.fn().mockResolvedValue([
          generateBankAccountDto(),
          generateBankAccountDto({ countryIso2: 'BY', name: 'bank2' }),
        ]),
      },
    });
    const useCase = new GetBankAccounts(options);

    const result = await useCase.execute(params);

    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
    expect(options.bankAccountsRepository.findAllBankAccounts).toBeCalledOnceWith({ providerCode });
    expect(result).toStrictEqual({ bankAccountsData: [
      {
        parameters: {
          countryAuthorities: [{ authority: 'GM', country: 'CY' }],
          currencies: ['EUR'],
        },
        bankAccounts: [
          {
            name: 'bank',
            type: 'bankAccount',
            configs: [{ key: 'key', value: 'value' }],
          },
        ],
      },
      {
        parameters: {
          countryAuthorities: [{ authority: 'GM', country: 'BY' }],
          currencies: ['EUR'],
        },
        bankAccounts: [
          {
            name: 'bank2',
            type: 'bankAccount',
            configs: [{ key: 'key', value: 'value' }],
          },
        ],
      },
    ],
    });
  });
});
