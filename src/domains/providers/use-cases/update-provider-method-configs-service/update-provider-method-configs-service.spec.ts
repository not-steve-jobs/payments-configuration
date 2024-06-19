import casual from 'casual';

import { TransactionType } from '@core';

import { UpdateProviderMethodConfigsServiceParams } from './types';
import { ChangeProviderMethodTransactionsConfigsServiceOptions, UpdateProviderMethodConfigsService } from './update-provider-method-configs-service';

describe('UpdateProviderMethodConfigsService', () => {
  it('Shouldn\'t invoke repos to update if configs are empty', async () => {
    const options = mock<ChangeProviderMethodTransactionsConfigsServiceOptions>({
      countryAuthorityRepository: { findOneOrThrow: jest.fn().mockResolvedValue({ id: 1 }) },
      countryAuthorityMethodRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      providerMethodRepository: { runInTransaction: jest.fn().mockImplementation(fn => fn({})) },
      transactionConfigRepository: {
        getProviderTransactionConfigs: jest.fn().mockResolvedValue([]),
      },
    });
    const params: UpdateProviderMethodConfigsServiceParams = {
      country: 'CY',
      authority: 'CYSEC',
      methodCode: 'bankwire',
      providerConfigs: [],
    };

    const service = new UpdateProviderMethodConfigsService(options);
    const response = await service.execute(params);

    expect(response).toHaveLength(0);
    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.countryAuthorityMethodRepository.findOneOrThrow).toBeCalledOnceWith(1, params.methodCode);
    expect(options.transactionConfigRepository.getProviderTransactionConfigs).toBeCalledOnceWith({
      methodCode: params.methodCode,
      authority: params.authority,
      country: params.country,
      includeEmptyConfigs: true,
    });
  });

  it('Should update configs', async () => {
    const countryAuthority = { id: casual.uuid };
    const countryAuthorityMethod = { id: casual.uuid };
    const providerMethod = { id: casual.uuid, defaultCurrency: null };
    const options = mock<ChangeProviderMethodTransactionsConfigsServiceOptions>({
      countryAuthorityRepository: { findOneOrThrow: jest.fn().mockResolvedValue(countryAuthority) },
      countryAuthorityMethodRepository: { findOneOrThrow: jest.fn().mockResolvedValue(countryAuthorityMethod) },
      providerMethodRepository: {
        runInTransaction: jest.fn().mockImplementation(fn => fn({})),
        findByCountryAuthorityIdOrThrow: jest.fn().mockResolvedValue(providerMethod),
        update: jest.fn().mockResolvedValue(providerMethod),
      },
      transactionConfigRepository: {
        getProviderTransactionConfigs: jest.fn().mockResolvedValue([]),
        findByProviderMethodId: jest.fn().mockResolvedValue([
          { providerMethodId: providerMethod.id, currencyIso3: 'USD', type: TransactionType.DEPOSIT },
        ]),
        bulkUpdate: jest.fn().mockResolvedValue({}),
        removeAll: jest.fn().mockResolvedValue({}),
      },
    });
    const params: UpdateProviderMethodConfigsServiceParams = {
      country: 'CY',
      authority: 'CYSEC',
      methodCode: 'bankwire',
      providerConfigs: [
        {
          providerCode: 'skrill',
          currencySettings: [
            { currency: 'USD', deposit: { isEnabled: true, minAmount: 1, maxAmount: 5 } },
          ],
          isEnabled: true,
        },
      ],
    };

    const service = new UpdateProviderMethodConfigsService(options);
    const response = await service.execute(params);

    expect(response).toHaveLength(0);
    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.countryAuthorityMethodRepository.findOneOrThrow).toBeCalledOnceWith(countryAuthority.id, params.methodCode);
    expect(options.providerMethodRepository.findByCountryAuthorityIdOrThrow).toBeCalledOnceWith(countryAuthorityMethod.id, 'skrill', {});
    expect(options.providerMethodRepository.update).toBeCalledOnceWith(providerMethod.id, { isEnabled: true, defaultCurrency: null }, {});
    expect(options.transactionConfigRepository.findByProviderMethodId).toBeCalledOnceWith(providerMethod.id, {});
    expect(options.transactionConfigRepository.bulkUpdate).toBeCalledOnceWith([{
      providerMethodId: providerMethod.id,
      type: TransactionType.DEPOSIT,
      currencyIso3: 'USD',
      isEnabled: true,
      maxAmount: 5,
      minAmount: 1,
      createdBy: 'unknown',
      updatedBy: 'unknown',
    }], {});
    expect(options.transactionConfigRepository.getProviderTransactionConfigs).toBeCalledOnceWith({
      methodCode: params.methodCode,
      authority: params.authority,
      country: params.country,
      includeEmptyConfigs: true,
    });
  });
});
