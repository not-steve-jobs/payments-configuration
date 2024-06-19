import casual from 'casual';

import { FieldRepository, TransactionConfigRepository } from '@infra';
import { ConfigFieldWithOptionDto, FieldEntityType, ProviderType, TransactionConfigDto, TransactionType } from '@core';
import { PlatformVersionsRestrictionsService } from '@domains/interop/services';

import { GetDepositConfigsService } from './get-deposit-config-service';

describe('GetDepositConfigsService', () => {
  it('should return the correct response', async () => {
    const providerMethodId = casual.uuid;
    const providerId = casual.uuid;
    const transactionConfigs: Partial<TransactionConfigDto>[] = [
      {
        providerId,
        providerMethodId,
        methodCode: 'cards',
        methodName: 'Visa/Mastercard',
        providerCode: 'Stripe',
        providerName: 'Stripe',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'EUR',
        minAmount: 80,
        maxAmount: 850,
        convertedCurrency: null,
      },
      {
        providerId,
        providerMethodId,
        methodCode: 'cards',
        methodName: 'Visa/Mastercard',
        providerCode: 'Stripe',
        providerName: 'Stripe',
        providerType: ProviderType.DEFAULT,
        currencyIso3: 'USD',
        minAmount: 100,
        maxAmount: 1000,
        convertedCurrency: null,
      },
    ];
    const fieldsMock: Partial<ConfigFieldWithOptionDto>[] = [
      {
        entityId: providerMethodId,
        entityType: FieldEntityType.PROVIDER_METHOD,
        key: 'key-1-1',
        defaultValue: 'value-1-1',
        valueType: 'value-type-1-1',
        isMandatory: true,
        pattern: 'pattern-1-1',
        optionKey: 'option-key-1-1',
        optionValue: 'option-value-1-1',
        optionIsEnabled: true,
      },
      {
        entityId: providerMethodId,
        entityType: FieldEntityType.PROVIDER_METHOD,
        key: 'key-1-1',
        defaultValue: 'value-1-1',
        valueType: 'value-type-1-1',
        isMandatory: true,
        pattern: 'pattern-1-1',
        optionKey: 'option-key-1-2',
        optionValue: 'option-value-1-2',
        optionIsEnabled: true,
      },
      {
        entityId: providerMethodId,
        entityType: FieldEntityType.PROVIDER_METHOD,
        key: 'key-1-1',
        defaultValue: 'value-1-1',
        valueType: 'value-type-1-1',
        isMandatory: true,
        pattern: 'pattern-1-1',
        optionKey: 'option-key-1-3',
        optionValue: 'option-value-1-3',
        optionIsEnabled: true,
      },
      {
        entityId: providerMethodId,
        entityType: FieldEntityType.PROVIDER_METHOD,
        key: 'key-1-2',
        defaultValue: 'value-1-2',
        valueType: 'value-type-1-2',
        isMandatory: true,
        pattern: 'pattern-1-2',
        optionKey: 'option-key-2-1',
        optionValue: 'option-value-2-1',
        optionIsEnabled: true,
      },
      {
        entityId: providerMethodId,
        entityType: FieldEntityType.PROVIDER_METHOD,
        key: 'key-1-2',
        defaultValue: 'value-1-2',
        valueType: 'value-type-1-2',
        isMandatory: true,
        pattern: 'pattern-1-2',
        optionKey: 'option-key-2-2',
        optionValue: 'option-value-2-2',
        optionIsEnabled: true,
      },
      {
        entityId: providerMethodId,
        entityType: FieldEntityType.PROVIDER_METHOD,
        key: 'key-1-2',
        defaultValue: 'value-1-2',
        valueType: 'value-type-1-2',
        isMandatory: true,
        pattern: 'pattern-1-2',
        optionKey: 'option-key-2-3',
        optionValue: 'option-value-2-3',
        optionIsEnabled: true,
      },
    ];
    const commonFieldsMock: Partial<ConfigFieldWithOptionDto>[] = [
      {
        entityId: providerId,
        entityType: FieldEntityType.PROVIDER,
        key: 'key-1-2',
        defaultValue: 'value-1-2-common',
        valueType: 'value-type-1-2-common',
        isMandatory: true,
        pattern: 'pattern-1-2-common',
        optionKey: 'option-key-2-3',
        optionValue: 'option-value-2-3-common',
        optionIsEnabled: true,
      },
      {
        entityId: providerId,
        entityType: FieldEntityType.PROVIDER,
        key: 'key-common',
        defaultValue: 'value-common',
        valueType: 'value-type-common',
        isMandatory: true,
        pattern: 'pattern-common',
        optionKey: 'option-key-common-1',
        optionValue: 'option-value-common-1',
        optionIsEnabled: true,
      },
      {
        entityId: providerId,
        entityType: FieldEntityType.PROVIDER,
        key: 'key-common',
        defaultValue: 'value-common',
        valueType: 'value-type-common',
        isMandatory: true,
        pattern: 'pattern-common',
        optionKey: 'option-key-common-2',
        optionValue: 'option-value-common-2',
        optionIsEnabled: true,
      },
    ];
    const transactionsMockRepository = mock<TransactionConfigRepository>({
      getProviderTransactionConfigs: jest.fn().mockReturnValue(transactionConfigs),
    });
    const fieldsMockRepository = mock<FieldRepository>({
      findFieldsWithOptions: jest.fn().mockReturnValue([...fieldsMock, ...commonFieldsMock]),
    });
    const service = new GetDepositConfigsService({
      transactionConfigRepository: transactionsMockRepository,
      fieldRepository: fieldsMockRepository,
      platformVersionsRestrictionsService: mock<PlatformVersionsRestrictionsService>({
        getAllowed: jest.fn().mockResolvedValue(true),
      }),
    });
    const expectedResult = [
      {
        key: 'cards',
        provider: 'Stripe',
        description: 'Visa/Mastercard',
        currencySettings: [
          { currency: 'EUR', min: 80, max: 850 },
          { currency: 'USD', min: 100, max: 1000 },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.DEFAULT,
        fields: [
          {
            key: 'key-1-1',
            value: 'value-1-1',
            type: 'value-type-1-1',
            required: true,
            pattern: 'pattern-1-1',
            options: [
              { key: 'option-key-1-1', value: 'option-value-1-1' },
              { key: 'option-key-1-2', value: 'option-value-1-2' },
              { key: 'option-key-1-3', value: 'option-value-1-3' },
            ],
          },
          {
            key: 'key-1-2',
            value: 'value-1-2',
            type: 'value-type-1-2',
            pattern: 'pattern-1-2',
            required: true,
            options: [
              { key: 'option-key-2-1', value: 'option-value-2-1' },
              { key: 'option-key-2-2', value: 'option-value-2-2' },
              { key: 'option-key-2-3', value: 'option-value-2-3' },
            ],
          },
          {
            key: 'key-common',
            value: 'value-common',
            type: 'value-type-common',
            pattern: 'pattern-common',
            required: true,
            options: [
              { key: 'option-key-common-1', value: 'option-value-common-1' },
              { key: 'option-key-common-2', value: 'option-value-common-2' },
            ],
          },
        ],
      },
    ];

    const result = await service.execute({
      country: 'AR',
      authority: 'CYSEC',
    });

    expect(transactionsMockRepository.getProviderTransactionConfigs)
      .toHaveBeenCalledWith({
        country: 'AR',
        authority: 'CYSEC',
        transactionType: TransactionType.DEPOSIT,
        isCamAndPmEnabled: true,
        isTransactionsConfigEnabled: true,
      });
    expect(result).toEqual(expectedResult);
  });

  it('should return the empty response', async () => {
    const mockTransactionConfigs: TransactionConfigDto[] = [];
    const mockFieldWithOptionDtos: ConfigFieldWithOptionDto[] = [];
    const transactionsMockRepository = mock<TransactionConfigRepository>({
      getProviderTransactionConfigs: jest.fn().mockReturnValue(mockTransactionConfigs),
    });
    const fieldsMockRepository = mock<FieldRepository>({
      findFieldsWithOptions: jest.fn().mockReturnValue(mockFieldWithOptionDtos),
    });
    const service = new GetDepositConfigsService({
      transactionConfigRepository: transactionsMockRepository,
      fieldRepository: fieldsMockRepository,
      platformVersionsRestrictionsService: mock<PlatformVersionsRestrictionsService>({
        getAllowed: jest.fn().mockResolvedValue(true),
      }),
    });

    const result = await service.execute({
      country: 'AR',
      authority: 'CYSEC',
    });

    expect(transactionsMockRepository.getProviderTransactionConfigs)
      .toHaveBeenCalledWith({
        country: 'AR',
        authority: 'CYSEC',
        transactionType: TransactionType.DEPOSIT,
        isCamAndPmEnabled: true,
        isTransactionsConfigEnabled: true,
      });
    expect(result).toHaveLength(0);
  });
});
