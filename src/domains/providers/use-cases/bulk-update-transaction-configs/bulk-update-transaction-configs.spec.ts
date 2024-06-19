import casual from 'casual';

import { CurrencySetting } from '@domains/providers/types';

import { BulkUpdateTransactionConfigs, BulkUpdateTransactionConfigsOptions } from './bulk-update-transaction-configs';
import { BulkUpdateTransactionConfigsParams } from './types';

describe('BulkUpdateTransactionConfigs', () => {
  it('Should update transaction configs', async () => {
    const provider = { id: casual.uuid };
    const providerMethod = { id: casual.uuid, countryIso2: 'cy', authorityFullCode: 'cysec', methodCode: 'bankwire' };
    const options = mock<BulkUpdateTransactionConfigsOptions>({
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue(provider) },
      providerMethodRepository: { findByCountryAuthorityMethods: jest.fn().mockResolvedValue([providerMethod]) },
      transactionConfigRepository: {
        bulkUpdate: jest.fn().mockResolvedValue({}),
        findAll: jest.fn().mockResolvedValue([]),
      },
      currencyRepository: { findAllIso3: jest.fn().mockResolvedValue([{ iso3: 'USD' }]) },
    });
    const params: BulkUpdateTransactionConfigsParams = {
      providerCode: casual.string,
      currencyConfigs: [
        mock<CurrencySetting>({
          currency: 'USD',
          deposit: {
            minAmount: 1, maxAmount: 5, isEnabled: true,
          },
          payout: {
            minAmount: 2, maxAmount: 6, isEnabled: false,
          },
          refund: {
            minAmount: 3, period: 7, isEnabled: true,
          },
        }),
      ],
      countryAuthorityMethods: [
        { country: 'CY', method: 'bankwire', authority: 'CYSEC' },
      ],
    };

    const service = new BulkUpdateTransactionConfigs(options);
    const response = await service.execute(params);

    expect(response).toBeUndefined();
    expect(options.providerRepository.findOneOrThrow).toBeCalledOnceWith({ code: params.providerCode  });
    expect(options.providerMethodRepository.findByCountryAuthorityMethods).toBeCalledOnceWith(
      provider.id, { countryAuthorityMethods: params.countryAuthorityMethods }
    );
    expect(options.transactionConfigRepository.bulkUpdate).toBeCalledOnceWith(expect.arrayContaining([
      expect.objectContaining({
        type: 'deposit',
        providerMethodId: providerMethod.id,
        currencyIso3: params.currencyConfigs[0].currency,
        minAmount: params.currencyConfigs[0].deposit?.minAmount,
        maxAmount: params.currencyConfigs[0].deposit?.maxAmount,
        isEnabled: params.currencyConfigs[0].deposit?.isEnabled,
      }),
      expect.objectContaining({
        type: 'refund',
        providerMethodId: providerMethod.id,
        currencyIso3: params.currencyConfigs[0].currency,
        minAmount: params.currencyConfigs[0].refund?.minAmount,
        period: params.currencyConfigs[0].refund?.period,
        isEnabled: params.currencyConfigs[0].refund?.isEnabled,
      }),
      expect.objectContaining({
        type: 'payout',
        providerMethodId: providerMethod.id,
        currencyIso3: params.currencyConfigs[0].currency,
        minAmount: params.currencyConfigs[0].payout?.minAmount,
        maxAmount: params.currencyConfigs[0].payout?.maxAmount,
        isEnabled: params.currencyConfigs[0].payout?.isEnabled,
      }),
    ]));
  });
});
