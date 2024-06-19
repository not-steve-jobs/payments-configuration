import casual from 'casual';

import { ProviderType, TransactionConfigDto, TransactionType } from '@core';
import { TransactionConfigRepository } from '@infra';
import { GetProviderMethodConfigsService } from '@domains/providers';

describe('GetProviderMethodConfigsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct response', async () => {
    const providerId = casual.uuid;
    // Mock repository response
    const mockTransactionConfigs: TransactionConfigDto[] = [
      {
        methodCode: 'method1',
        isEnabled: true,
        providerId,
        providerCode: 'provider1',
        providerName: 'Provider 1',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'USD',
        type: TransactionType.DEPOSIT,
        minAmount: 10,
        maxAmount: 100,
        period: null,
        isProviderMethodEnabled: true,
        isPayoutAsRefund: false,
        isPaymentAccountRequired: false,
        order: 0,
        refundsOrder: 0,
        payoutsOrder: 0,
        providerMethodId: '',
        methodName: 'method1',
        convertedCurrency: null,
        defaultCurrency: null,
      },
      {
        methodCode: 'method1',
        isEnabled: true,
        providerId,
        providerCode: 'provider1',
        providerName: 'Provider 1',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'USD',
        type: TransactionType.REFUND,
        minAmount: 10,
        maxAmount: null,
        period: 10,
        isProviderMethodEnabled: true,
        isPayoutAsRefund: false,
        isPaymentAccountRequired: false,
        order: 0,
        refundsOrder: 0,
        payoutsOrder: 0,
        providerMethodId: '',
        methodName: 'method1',
        convertedCurrency: null,
        defaultCurrency: null,
      },
      {
        methodCode: 'method1',
        isEnabled: true,
        providerId,
        providerCode: 'provider1',
        providerName: 'Provider 1',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'USD',
        type: TransactionType.PAYOUT,
        minAmount: 10,
        maxAmount: 100,
        period: null,
        isProviderMethodEnabled: true,
        isPayoutAsRefund: false,
        isPaymentAccountRequired: false,
        order: 0,
        refundsOrder: 0,
        payoutsOrder: 0,
        providerMethodId: '',
        methodName: 'method1',
        convertedCurrency: null,
        defaultCurrency: null,
      },
      {
        methodCode: 'method1',
        isEnabled: true,
        providerId,
        providerCode: 'provider1',
        providerName: 'Provider 1',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'EUR',
        type: TransactionType.DEPOSIT,
        minAmount: 20,
        maxAmount: 200,
        period: null,
        isProviderMethodEnabled: true,
        isPayoutAsRefund: false,
        isPaymentAccountRequired: false,
        order: 0,
        refundsOrder: 0,
        payoutsOrder: 0,
        providerMethodId: '',
        methodName: 'method1',
        convertedCurrency: null,
        defaultCurrency: null,
      },
      {
        methodCode: 'method1',
        isEnabled: true,
        providerId,
        providerCode: 'provider1',
        providerName: 'Provider 1',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'EUR',
        type: TransactionType.REFUND,
        minAmount: 20,
        maxAmount: null,
        period: 20,
        isProviderMethodEnabled: true,
        isPayoutAsRefund: false,
        isPaymentAccountRequired: false,
        order: 0,
        refundsOrder: 0,
        payoutsOrder: 0,
        providerMethodId: '',
        methodName: 'method1',
        convertedCurrency: null,
        defaultCurrency: null,
      },
      {
        methodCode: 'method1',
        isEnabled: true,
        providerId,
        providerCode: 'provider1',
        providerName: 'Provider 1',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'EUR',
        type: TransactionType.PAYOUT,
        minAmount: 20,
        maxAmount: 200,
        period: null,
        isProviderMethodEnabled: true,
        isPayoutAsRefund: false,
        isPaymentAccountRequired: false,
        order: 0,
        refundsOrder: 0,
        payoutsOrder: 0,
        providerMethodId: '',
        methodName: 'method1',
        convertedCurrency: null,
        defaultCurrency: null,
      },
    ];

    const mockRepository = mock<TransactionConfigRepository>({
      getProviderTransactionConfigs: jest.fn().mockReturnValue(mockTransactionConfigs),
    });

    // Create an instance of the service with the mocked repository
    const service = new GetProviderMethodConfigsService({
      transactionConfigRepository: mockRepository,
    });

    // Define the expected result
    const expectedResult = [
      {
        providerCode: 'provider1',
        providerName: 'Provider 1',
        isEnabled: true,
        currencySettings: [{
          currency: 'USD',
          deposit: {
            minAmount: 10,
            maxAmount: 100,
            isEnabled: true,
          },
          refund: {
            minAmount: 10,
            period: 10,
            isEnabled: true,
          },
          payout: {
            minAmount: 10,
            maxAmount: 100,
            isEnabled: true,
          },
        }, {
          currency: 'EUR',
          deposit: {
            minAmount: 20,
            maxAmount: 200,
            isEnabled: true,
          },
          refund: {
            minAmount: 20,
            period: 20,
            isEnabled: true,
          },
          payout: {
            minAmount: 20,
            maxAmount: 200,
            isEnabled: true,
          },
        }],
      },
    ];

    const result = await service.execute({
      methodCode: 'method1',
      country: 'US',
      authority: 'authority1',
    });

    expect(mockRepository.getProviderTransactionConfigs).toHaveBeenCalledWith({
      authority: 'authority1',
      country: 'US',
      methodCode: 'method1',
      includeEmptyConfigs: true,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should return the empty response', async () => {
    const mockTransactionConfigs: TransactionConfigDto[] = [];

    const mockRepository = mock<TransactionConfigRepository>({
      getProviderTransactionConfigs: jest.fn().mockReturnValue(mockTransactionConfigs),
    });
    // Create an instance of the service with the mocked repository
    const service = new GetProviderMethodConfigsService({
      transactionConfigRepository: mockRepository,
    });

    // Call the service method
    const result = await service.execute({
      methodCode: 'method1',
      country: 'USA',
      authority: 'authority1',
    });

    // Check if the repository method was called with the correct arguments
    expect(mockRepository.getProviderTransactionConfigs).toHaveBeenCalledWith({
      authority: 'authority1',
      country: 'USA',
      methodCode: 'method1',
      includeEmptyConfigs: true,
    });

    // Check that the result is empty
    expect(result).toEqual([]);
  });
});
