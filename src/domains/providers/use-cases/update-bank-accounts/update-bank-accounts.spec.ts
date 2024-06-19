import {
  UpdateBankAccounts,
  UpdateBankAccountsOptions,
  UpdateBankAccountsParams,
} from '@domains/providers';
import { NotFoundError } from '@internal/errors-library';

describe('UpdateBankAccounts', () => {
  it('Should throw not found error for non existing provider', async () => {
    const providerCode = 'test';
    const params: UpdateBankAccountsParams = { providerCode, bankAccountsData: [] };
    const options = mock<UpdateBankAccountsOptions>({
      providerRepository: {
        findOneOrThrow: jest.fn().mockRejectedValue(new NotFoundError('Unknown Provider', { id: providerCode })),
      },
      bankAccountsRepository: {},
    });
    const useCase = new UpdateBankAccounts(options);

    await expect(useCase.execute(params)).rejects.toThrow('Unknown Provider');
    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
  });

  it('Should return empty bank accounts data', async () => {
    const providerCode = 'test';
    const params: UpdateBankAccountsParams = { providerCode, bankAccountsData: [] };
    const options = mock<UpdateBankAccountsOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      providerMethodRepository: { findCABoundedToProvider: jest.fn().mockResolvedValue([]) },
      currencyRepository: { findAllIso3: jest.fn().mockResolvedValue([]) },
      bankAccountsRepository: {
        replaceBankAccounts: jest.fn().mockResolvedValue([]),
        findAllBankAccounts: jest.fn().mockResolvedValue([]),
      },
    });
    const useCase = new UpdateBankAccounts(options);

    const result = await useCase.execute(params);
    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: providerCode });
    expect(options.bankAccountsRepository.replaceBankAccounts).toBeCalledOnceWith(providerCode, []);
    expect(result).toStrictEqual({ bankAccountsData: [] });
  });
});
