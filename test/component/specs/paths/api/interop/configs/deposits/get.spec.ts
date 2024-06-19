import request from 'supertest';

import { CommonMandatoryQueryParameters } from '@test-component/constant';
import {
  DataSetBuilder,
  generateCommonAuthorityAndCountryQueryParameters,
  generateGetDepositsQueryParameters,
} from '@test-component/data';
import {
  cleanUp,
  validateInvalidCountryLengthResponse,
  validateMandatoryParameterResponse,
} from '@test-component/utils';
import { ApplicationPlatforms, DEFAULT_FIELD_PATTERN, FieldEntityType, ProviderType, TransactionType } from '@core';

describe('GET api/interop/configs/deposits', () => {
  const sendRequest = (query: Record<string, unknown>): request.Test =>
    request(baseUrl).get('api/interop/configs/deposits').query(query);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(CommonMandatoryQueryParameters)(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s`, async field => {
    const query = generateGetDepositsQueryParameters();
    delete query[field];

    const { statusCode, body } = await sendRequest(query);

    validateMandatoryParameterResponse(field, 'query', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if country longer than 2 symbols', async () => {
    const query = generateGetDepositsQueryParameters({ country: 'test' });

    const { statusCode, body } = await sendRequest(query);

    validateInvalidCountryLengthResponse(statusCode, body);
  });

  it('Should return empty array if there is no configs', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withProviderMethods()
      .build();

    const query = generateGetDepositsQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(0);
  });

  it('Should return deposit configs without fields', async () => {
    const { countryAuthority, provider, method, transactionConfig } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .build();

    const query = generateGetDepositsQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        key: method.code,
        provider: provider.code,
        description: method.name,
        currencySettings: [
          {
            currency: transactionConfig.currencyIso3,
            min: transactionConfig.minAmount,
            max: transactionConfig.maxAmount,
          },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.DEFAULT,
        fields: [],
      },
    ]);
  });

  it('Should return ".+" pattern for fields if value is empty', async () => {
    const { provider, countryAuthority, field, currency } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withField({ pattern: '', isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .build();
    await DataSetBuilder.create().withProviderField({
      providerCode: provider.code,
      authorityFullCode: countryAuthority.authorityFullCode,
      countryIso2: countryAuthority.countryIso2,
      currencyIso3: currency.iso3,
      fields: JSON.stringify([
        { key: field.key, defaultValue: field.defaultValue, valueType: field.valueType, isEnabled: true, isMandatory: field.isMandatory, options: [] },
      ]),
    }).build();

    const query = generateGetDepositsQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body: [{ fields }] } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(fields).toStrictEqual([
      {
        key: field.key,
        required: Boolean(field.isMandatory),
        type: field.valueType,
        value: field.defaultValue,
        options: [],
        pattern: DEFAULT_FIELD_PATTERN,
      },
    ]);
  });

  it('Should return deposit configs if has exact match by version', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .withProviderRestriction({
        settings: JSON.stringify([{ condition: 'eq', version: '1.0.1' }]),
        platform: ApplicationPlatforms.IOS,
      })
      .build();

    const query = generateGetDepositsQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
      platform: 'ios',
      version: '1.0.1',
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(1);
  });

  it('Should return empty deposit configs if exact restrictions by version', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .withProviderRestriction({
        settings: JSON.stringify([{ condition: 'eq', version: '1.0.1' }]),
        platform: ApplicationPlatforms.IOS,
      })
      .build();

    const query = generateGetDepositsQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
      platform: 'ios',
      version: '1.0.2',
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('Should return all deposit configs if version does not match but isEnabled false', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .withProviderRestriction({
        settings: JSON.stringify([
          { condition: 'gte', version: '1.0.0' },
          { condition: 'lte', version: '2.0.0' },
        ]),
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: false,
      })
      .build();

    const query = generateGetDepositsQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
      platform: 'android',
      version: '3.0.1',
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(1);
  });

  it('Should not return deposit configs if settings is an empty array', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .withProviderRestriction({
        platform: ApplicationPlatforms.ANDROID,
      })
      .build();

    const query = generateGetDepositsQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
      platform: ApplicationPlatforms.ANDROID,
      version: '1.0.1',
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(0);
  });

  it('Should return deposit configs if has restrictions by version', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .withProviderRestriction({
        settings: JSON.stringify([
          { condition: 'gte', version: '1.0.0' },
          { condition: 'lte', version: '2.0.0' },
        ]),
        platform: ApplicationPlatforms.ANDROID,
      })
      .build();

    const query = generateGetDepositsQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
      platform: 'android',
      version: '1.0.1',
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(1);
  });

  it.each([
    { defaultCurrency: JSON.stringify({ isEnabled: true, currency: 'USD' }), expected: 'USD' },
    { defaultCurrency: JSON.stringify({ isEnabled: false, currency: 'EUR' }), expected: null },
    { defaultCurrency: '', expected: null },
    { defaultCurrency: null, expected: null },
    { defaultCurrency: '{', expected: null },
  ])('Should return defaultCurrency $expected if defaultCurrency is $defaultCurrency', async ({ defaultCurrency, expected }) => {
    const { countryAuthority, provider, method, transactionConfig } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true, defaultCurrency })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .build();

    const query = generateGetDepositsQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        key: method.code,
        provider: provider.code,
        description: method.name,
        currencySettings: [
          {
            currency: transactionConfig.currencyIso3,
            min: transactionConfig.minAmount,
            max: transactionConfig.maxAmount,
          },
        ],
        convertedCurrency: null,
        defaultCurrency: expected,
        type: 'crypto',
        fields: [],
      },
    ]);
  });

  it('Should return deposit configs with type crypto', async () => {
    const { countryAuthority, provider, method, transactionConfig } = await DataSetBuilder
      .create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withProvider({ type: ProviderType.CRYPTO })
      .build();

    const query = generateGetDepositsQueryParameters({ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        key: method.code,
        provider: provider.code,
        description: method.name,
        currencySettings: [
          {
            currency: transactionConfig.currencyIso3,
            min: transactionConfig.minAmount,
            max: transactionConfig.maxAmount,
          },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.CRYPTO,
        fields: [],
      },
    ]);
  });

  it('Should return deposit configs with both enabled fields', async () => {
    const optionDto = { key: 'option_1', value: 'option_value_1', isEnabled: true };
    const {
      countryAuthority,
      providerMethod,
      method,
      provider,
      transactionConfig,
      field,
      currency,
    } = await DataSetBuilder.create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withField({ key: 'aaa', transactionType: TransactionType.DEPOSIT, defaultValue: 'test', isEnabled: true })
      .withFieldOption(optionDto)
      .build();
    const { field: fieldSecond } = await DataSetBuilder.create()
      .withField({ entityType: FieldEntityType.PROVIDER_METHOD, entityId: providerMethod.id, key: 'bbb', isEnabled: true })
      .build();
    await DataSetBuilder.create().withProviderField({
      providerCode: provider.code,
      transactionType: TransactionType.DEPOSIT,
      authorityFullCode: countryAuthority.authorityFullCode,
      countryIso2: countryAuthority.countryIso2,
      currencyIso3: currency.iso3,
      fields: JSON.stringify([
        // eslint-disable-next-line max-len
        { key: field.key, defaultValue: field.defaultValue, valueType: field.valueType, isMandatory: field.isMandatory, isEnabled: field.isEnabled, options: [optionDto] },
        // eslint-disable-next-line max-len
        { key: fieldSecond.key, defaultValue: fieldSecond.defaultValue, valueType: fieldSecond.valueType, isMandatory: fieldSecond.isMandatory, isEnabled: fieldSecond.isEnabled, options: [] },
      ]),
    }).build();

    const query = generateGetDepositsQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        key: method.code,
        provider: provider.code,
        description: method.name,
        currencySettings: [
          {
            currency: transactionConfig.currencyIso3,
            min: transactionConfig.minAmount,
            max: transactionConfig.maxAmount,
          },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.DEFAULT,
        fields: [
          {
            key: field.key,
            value: field.defaultValue,
            type: field.valueType,
            required: Boolean(field.isMandatory),
            pattern: field.pattern,
            options: [
              {
                key: optionDto.key,
                value: optionDto.value,
              },
            ],
          },
          {
            key: fieldSecond.key,
            value: fieldSecond.defaultValue,
            type: fieldSecond.valueType,
            required: Boolean(fieldSecond.isMandatory),
            pattern: fieldSecond.pattern,
            options: [],
          },
        ],
      },
    ]);
  });

  it('Should return only enabled options', async () => {
    const optionDto = { key: 'option_key_1', value: 'field-test', isEnabled: true };
    const {
      countryAuthority,
      method,
      provider,
      transactionConfig,
      field,
      currency,
    } = await DataSetBuilder.create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withField({ transactionType: TransactionType.DEPOSIT, defaultValue: 'test', isEnabled: true })
      .withFieldOption({ ...optionDto, isEnabled: false })
      .build();
    const { fieldOption } = await DataSetBuilder.create().withFieldOption({
      fieldId: field.id,
      ...optionDto,
      isEnabled: true,
    }).build();
    await DataSetBuilder.create().withProviderField({
      providerCode: provider.code,
      authorityFullCode: countryAuthority.authorityFullCode,
      countryIso2: countryAuthority.countryIso2,
      currencyIso3: currency.iso3,
      fields: JSON.stringify([
        // eslint-disable-next-line max-len
        { key: field.key, defaultValue: field.defaultValue, valueType: field.valueType, isMandatory: field.isMandatory, isEnabled: field.isEnabled, options: [optionDto, { ...optionDto, isEnabled: false }] },
      ]),
    }).build();

    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        key: method.code,
        provider: provider.code,
        description: method.name,
        currencySettings: [
          {
            currency: transactionConfig.currencyIso3,
            min: transactionConfig.minAmount,
            max: transactionConfig.maxAmount,
          },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.DEFAULT,
        fields: [
          {
            key: field.key,
            value: field.defaultValue,
            type: field.valueType,
            required: Boolean(field.isMandatory),
            pattern: field.pattern,
            options: [
              {
                key: fieldOption.key,
                value: fieldOption.value,
              },
            ],
          },
        ],
      },
    ]);
  });

  it('Should return only enabled fields for deposit config', async () => {
    const optionDto = { key: 'option_1', value: 'option_value_1', isEnabled: true };
    const {
      countryAuthority,
      providerMethod,
      method,
      provider,
      transactionConfig,
      field,
      fieldOption,
      currency,
    } = await DataSetBuilder.create()
      .withCountryAuthorityMethod({ isEnabled: true })
      .withProviderMethod({ isEnabled: true })
      .withConfigs({ type: TransactionType.DEPOSIT, isEnabled: true })
      .withField({ transactionType: TransactionType.DEPOSIT, defaultValue: 'test', isEnabled: true })
      .withFieldOption(optionDto)
      .build();
    await DataSetBuilder.create()
      .withField({ entityType: FieldEntityType.PROVIDER_METHOD, entityId: providerMethod.id, isEnabled: false })
      .build();
    await DataSetBuilder.create().withProviderField({
      providerCode: provider.code,
      authorityFullCode: countryAuthority.authorityFullCode,
      countryIso2: countryAuthority.countryIso2,
      currencyIso3: currency.iso3,
      fields: JSON.stringify([
        { key: field.key, defaultValue: field.defaultValue, valueType: field.valueType, isMandatory: field.isMandatory, isEnabled: true, options: [optionDto] },
        { key: 'new', defaultValue: 'new', valueType: 'new', isMandatory: field.isMandatory, isEnabled: false, options: [] },
      ]),
    }).build();

    const query = generateGetDepositsQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        key: method.code,
        provider: provider.code,
        description: method.name,
        currencySettings: [
          {
            currency: transactionConfig.currencyIso3,
            min: transactionConfig.minAmount,
            max: transactionConfig.maxAmount,
          },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.DEFAULT,
        fields: [
          {
            key: field.key,
            value: field.defaultValue,
            type: field.valueType,
            required: Boolean(field.isMandatory),
            pattern: field.pattern,
            options: [
              {
                key: fieldOption.key,
                value: fieldOption.value,
              },
            ],
          },
        ],
      },
    ]);
  });
});
