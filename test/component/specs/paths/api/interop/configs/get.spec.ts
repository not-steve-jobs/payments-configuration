import request from 'supertest';

import { CommonMandatoryQueryParameters } from '@test-component/constant';
import { DataSetBuilder, generateCommonAuthorityAndCountryQueryParameters } from '@test-component/data';
import {
  cleanUp,
  validateInvalidCountryLengthResponse,
  validateMandatoryParameterResponse,
} from '@test-component/utils';
import { DEFAULT_FIELD_PATTERN, FieldEntityType, TransactionType } from '@core';

describe(`GET api/interop/configs`, () => {
  const sendRequest = (query: Record<string, unknown>): request.Test =>
    request(baseUrl).get(`api/interop/configs`).query(query);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(CommonMandatoryQueryParameters)(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s`, async field => {
    const query = generateCommonAuthorityAndCountryQueryParameters();
    delete query[field];

    const { statusCode, body } = await sendRequest(query);

    validateMandatoryParameterResponse(field, 'query', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if country longer than 2 symbols', async () => {
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: 'test' });

    const { statusCode, body } = await sendRequest(query);

    validateInvalidCountryLengthResponse(statusCode, body);
  });

  it('Should return empty array', async () => {
    const { countryAuthority } = await DataSetBuilder.create().withCAMethods().build();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('Should return data even if transaction configs are empty', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withCA()
      .withMethod()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProvider()
      .withProviderMethod({ isEnabled: true })
      .build();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('Should return configs including common', async () => {
    const { countryAuthority, currency, provider } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withAuthority({ fullCode: 'UPPERCASE' })
      .withConfigs({
        type: TransactionType.REFUND,
        isEnabled: true,
        currencyIso3: 'ILS',
      })
      .withCurrency({ iso3: 'ILS' })
      .withCredential({ currencyIso3: 'ILS', credentialsDetails: JSON.stringify([{ key: 'one', value: 'one' }]) })
      .build();
    await DataSetBuilder.create().withCredential({
      providerCode: provider.code,
      credentialsDetails: JSON.stringify([{ key: 'two', value: 'two' }]),
      authorityFullCode: null,
      countryIso2: null,
      currencyIso3: null,
    }).build();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: countryAuthority.countryIso2, authority: 'uppercase' });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject([
      {
        currency: currency.iso3,
        providers: [
          {
            key: provider.code,
            name: provider.name,
            depositSettings: { enabled: false, fields: [] },
            payoutSettings: { fields: [] },
            config: [{ key: 'two', value: 'two' }, { key: 'one', value: 'one' }],
            refundSettings: {
              order: 0,
              enabled: true,
              minRefundableAmountThreshold: 0,
              maxRefundablePeriodInDays: 0,
              isRequestDetailsRequired: false,
            },
          },
        ],
      },
    ]);
  });

  it('Should return configs', async () => {
    const { countryAuthority, currency, provider } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({
        type: TransactionType.REFUND,
        isEnabled: true,
      })
      .build();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject([
      {
        currency: currency.iso3,
        providers: [
          {
            key: provider.code,
            name: provider.name,
            maintenance: false,
            depositSettings: { enabled: false, fields: [] },
            payoutSettings: { fields: [] },
            refundSettings: {
              order: 0,
              enabled: true,
              minRefundableAmountThreshold: 0,
              maxRefundablePeriodInDays: 0,
              isRequestDetailsRequired: false,
            },
          },
        ],
      },
    ]);
  });

  it('Should return configs with common fields', async () => {
    const optionDto = { key: 'option_1', value: 'option_value_1', isEnabled: true };
    const { countryAuthority, currency, provider } = await DataSetBuilder
      .create()
      .withConfigs({
        type: TransactionType.DEPOSIT,
        isEnabled: true,
        maxAmount: 100,
        minAmount: 0,
      })
      .withProviderMethod({ isEnabled: true })
      .withCountryAuthorityMethod({ isEnabled: true })
      .build();
    const { field } = await DataSetBuilder.create().withField({
      entityId: provider.id,
      entityType: FieldEntityType.PROVIDER,
      key: 'test_key',
      value: 'test_name',
      valueType: 'string',
      transactionType: TransactionType.DEPOSIT,
      isMandatory: true,
      isEnabled: true,
    })
      .withFieldOption(optionDto)
      .withProviderField({
        providerCode: provider.code,
        currencyIso3: currency.iso3,
        authorityFullCode: countryAuthority.authorityFullCode,
        countryIso2: null,
        transactionType: TransactionType.DEPOSIT,
        fields: JSON.stringify([
          { key: 'test_key', name: 'test_name', valueType: 'string', isMandatory: true, isEnabled: true, options: [optionDto] },
        ]),
      })
      .build();

    const query = generateCommonAuthorityAndCountryQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject([
      {
        currency: currency.iso3,
        providers: [
          {
            key: provider.code,
            name: provider.name,
            maintenance: false,
            depositSettings: {
              max: 100,
              min: 0,
              enabled: true,
              fields: [
                {
                  key: field.key,
                  name: field.value,
                  type: field.valueType,
                  validation: DEFAULT_FIELD_PATTERN,
                  options: [{ key: optionDto.key, description: optionDto.value, enabled: optionDto.isEnabled }],
                  required: true,
                },
              ],
            },
            payoutSettings: { fields: [] },
          },
        ],
      },
    ]);
  });

  it('Should return order across transaction types', async () => {
    const ds = await DataSetBuilder
      .create()
      .withProvider()
      .withCAMethods({ isEnabled: true })
      .withProviderMethod({ isEnabled: true, refundsOrder: 9 })
      .withCurrency()
      .withTransactionConfig({ type: TransactionType.REFUND, isEnabled: true })
      .build();
    await DataSetBuilder
      .create()
      .withMethod()
      .withCountryAuthorityMethod({ countryAuthorityId: ds.countryAuthority.id, isEnabled: true })
      .withProviderMethod({ providerId: ds.provider.id, isEnabled: true, payoutsOrder: 4 })
      .withTransactionConfig({ currencyIso3: ds.currency.iso3, type: TransactionType.PAYOUT, isEnabled: true })
      .build();
    await DataSetBuilder
      .create()
      .withMethod()
      .withCountryAuthorityMethod({ depositsOrder: 8, countryAuthorityId: ds.countryAuthority.id, isEnabled: true })
      .withProviderMethod({
        providerId: ds.provider.id,
        payoutsOrder: 4,
        isEnabled: true,
      }).withTransactionConfig({ currencyIso3: ds.currency.iso3, type: TransactionType.DEPOSIT, isEnabled: true }).build();

    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: ds.countryAuthority.countryIso2,
      authority: ds.countryAuthority.authorityFullCode,
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        currency: ds.currency.iso3,
        providers: [
          {
            key: ds.provider.code,
            name: ds.provider.name,
            maintenance: false,
            accounts: [],
            config: [],
            defaultLeverage: 0,
            fields: [],
            depositSettings: {
              enabled: true,
              fields: [],
              min: 0,
              max: 100,
            },
            payoutSettings: {
              enabled: true,
              min: 0,
              max: 100,
              order: 4,
              paymentAccountRequired: false,
              fields: [],
            },
            refundSettings: {
              enabled: true,
              isRequestDetailsRequired: false,
              maxRefundablePeriodInDays: 0,
              minRefundableAmountThreshold: 0,
              order: 9,
            },
            settings: [],
            stpAllowed: false,
            stpMaxDepositAmount: 0,
            stpMinDepositsCount: 0,
            stpSettings: {},
            transactionRejectApplicable: false,
            withdrawalFields: [],
          },
        ],
      },
    ]);
  });

  it('Should return configs with bank accounts', async () => {
    const { countryAuthority, currency, provider, bankAccount } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.REFUND, isEnabled: true })
      .withBankAccount({ configs: JSON.stringify([{ key: 1, value: 2 }]) })
      .build();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject([
      {
        currency: currency.iso3,
        providers: [
          {
            key: provider.code,
            name: provider.name,
            maintenance: false,
            depositSettings: { enabled: false, fields: [] },
            payoutSettings: { fields: [] },
            refundSettings: {
              order: 0,
              enabled: true,
              minRefundableAmountThreshold: 0,
              maxRefundablePeriodInDays: 0,
              isRequestDetailsRequired: false,
            },
            accounts: [{ name: bankAccount.name, type: bankAccount.type, config: JSON.parse(bankAccount.configs) }],
          },
        ],
      },
    ]);
  });

  it('Should return configs with fields and only enabled options', async () => {
    const optionDto = { key: 'option_1', value: 'option_value_1', isEnabled: true };
    const { countryAuthority, currency, provider, field, providerMethod } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withField({
        key: 'test_key',
        value: 'test_name',
        valueType: 'string',
        transactionType: TransactionType.DEPOSIT,
        isMandatory: true,
        isEnabled: true,
      })
      .withFieldOption({ isEnabled: false })
      .withConfigs({
        type: TransactionType.DEPOSIT,
        isEnabled: true,
        maxAmount: 100,
        minAmount: 0,
        currencyIso3: 'ILS',
      })
      .withProviderField({
        transactionType: TransactionType.DEPOSIT,
        fields: JSON.stringify([
          { key: 'test_key', name: 'test_name', valueType: 'string', isMandatory: true, isEnabled: true, options: [optionDto] },
        ]),
      })
      .withCurrency({ iso3: 'ILS' })
      .withCredential({ currencyIso3: 'ILS', credentialsDetails: JSON.stringify([{ key: 'one', value: 'one' }]) })
      .build();
    await DataSetBuilder.create().withField({
      entityId: providerMethod.id,
      entityType: FieldEntityType.PROVIDER_METHOD,
      key: 'test_key_payout',
      value: 'test_name_payout',
      valueType: 'string',
      transactionType: TransactionType.PAYOUT,
      isMandatory: true,
      isEnabled: true,
    }).build();
    await DataSetBuilder.create().withFieldOption({ fieldId: field.id, ...optionDto, isEnabled: true }).build();

    const query = generateCommonAuthorityAndCountryQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject([
      {
        currency: currency.iso3,
        providers: [
          {
            key: provider.code,
            name: provider.name,
            maintenance: false,
            depositSettings: {
              max: 100,
              min: 0,
              enabled: true,
              fields: [
                {
                  key: 'test_key',
                  name: 'test_name',
                  type: 'string',
                  validation: DEFAULT_FIELD_PATTERN,
                  options: [{ key: optionDto.key, description: optionDto.value, enabled: true }],
                  required: true,
                },
              ],
            },
            payoutSettings: { fields: [] },
            config: [{ key: 'one', value: 'one' }],
          },
        ],
      },
    ]);
  });
});
