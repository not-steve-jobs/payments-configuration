import casual from 'casual';

import {
  ConfigFieldWithOptionDto,
  DEFAULT_FIELD_PATTERN,
  FieldEntityType,
  TransactionConfigDto,
  TransactionType,
} from '@core';

import { ConfigsFactory, CreateConfigsParams } from './configs-factory';

describe('ConfigsFactory', () => {
  it('Should create empty config', async () => {
    const params = mock<CreateConfigsParams>({
      commonFields: [],
      specificFields: [],
      country: 'CY',
      authority: 'CYSEC',
      bankAccounts: [],
      credentials: [],
    });
    const result = ConfigsFactory.createConfigs([], params);

    expect(result).toStrictEqual([]);
  });

  it('Should create config with EUR currency', async () => {
    const providerMethodConfigDto = mock<TransactionConfigDto>({
      providerName: 'Stripe',
      providerCode: 'stripe',
      providerMethodId: casual.uuid,
      type: TransactionType.DEPOSIT,
      minAmount: 100,
      maxAmount: 10000,
      currencyIso3: 'USD',
      isEnabled: true,
    });
    const field = mock<ConfigFieldWithOptionDto>({
      key: casual.string,
      value: casual.string,
      transactionType: TransactionType.DEPOSIT,
      entityType: FieldEntityType.PROVIDER_METHOD,
      valueType: 'string',
      entityId: providerMethodConfigDto.providerMethodId,
      currencyIso3: '',
      isMandatory: false,
    });
    const params = mock<CreateConfigsParams>({
      commonFields: [],
      specificFields: [field],
      country: 'CY',
      authority: 'CYSEC',
      bankAccounts: [],
      credentials: [],
    });

    const result = ConfigsFactory.createConfigs([providerMethodConfigDto], params);

    expect(result).toStrictEqual([
      {
        currency: providerMethodConfigDto.currencyIso3,
        providers: [
          {
            key: providerMethodConfigDto.providerCode,
            name: providerMethodConfigDto.providerName,
            maintenance: false,
            payoutSettings: { fields: [] },
            stpSettings: {},
            stpAllowed: false,
            stpMinDepositsCount: 0,
            stpMaxDepositAmount: 0,
            defaultLeverage: 0,
            transactionRejectApplicable: false,
            config: [],
            settings: [],
            fields: [],
            withdrawalFields: [],
            accounts: [],
            depositSettings: {
              min: providerMethodConfigDto.minAmount,
              max: providerMethodConfigDto.maxAmount,
              enabled: providerMethodConfigDto.isEnabled,
              fields: [
                {
                  key: field.key,
                  name: field.value,
                  type: field.valueType,
                  required: field.isMandatory,
                  options: [],
                  validation: DEFAULT_FIELD_PATTERN,
                },
              ],
            },
          },
        ],
      },
    ]);
  });
});
