import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { cleanUp, getConfig, skipIf, validateMandatoryParameterResponse } from '@test-component/utils';
import { DEFAULT_FIELD_PATTERN, FieldEntityType, FieldValueType, TransactionType } from '@core';
import { UpdateFieldsParameters } from '@test-component/constant';
import { DbTable, LooseObject, dbSelect } from '@internal/component-test-library';
import { UpsertProviderFieldsServiceReqBody } from '@domains/providers/types/contracts';

const UNSUPPORTED_KEY_SYMBOLS = '!@#$%^'.split('');
const SUPPORTED_SYMBOLS = [...'aZ09_&()-.ī,_:'.split(''), ' abc def '];

describe('PUT /api/providers/{code}/fields/bulk-update V1', () => {
  const config = getConfig();
  const useNewFieldsSchema = config.features?.useNewFieldsSchema ?? false;

  skipIf(useNewFieldsSchema);

  beforeEach(async () => await cleanUp());

  const sendRequest = (code: string, payload: object): request.Test =>
    request(baseUrl)
      .put(`api/providers/${code}/fields/bulk-update`)
      .withAuth()
      .send(payload);

  it('Should throw ERR_VALIDATION_REQUEST if payload is not an object', async () => {
    const { statusCode, body } = await sendRequest('stripe', []);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must be object","path":"/body","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it.each([
    [null, 'must be string'],
    [undefined, `must have required property 'pattern'`],
    ['', 'must NOT have fewer than 1 characters'],
    ['X'.repeat(701), 'must NOT have more than 700 characters'],
  ])('Should throw ERR_VALIDATION_REQUEST if got nullable pattern', async (pattern, errMsg) => {
    const payload = {
      common: [{
        key: 'key_1',
        name: 'name_new_1',
        defaultValue: '',
        fieldType: FieldValueType.STRING,
        transactionType: TransactionType.DEPOSIT,
        pattern,
        isEnabled: true,
        isMandatory: true,
        options: [],
      }],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"${errMsg}","path":"/body/common/0/pattern","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if got unknown field type', async () => {
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [{
        key: 'key_1',
        name: 'name_new_1',
        defaultValue: '',
        fieldType: 'unknown',
        transactionType: TransactionType.DEPOSIT,
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: true,
        isMandatory: true,
        options: [],
      }],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: '[{\"message\":\"must be equal to one of the allowed values: bool, string, select\",\"path\":\"/body/common/0/fieldType\",\"value\":null}]',
      },
      requestId: expect.toBeGUID(),
    });
  });

  it.each(Object.values(UpdateFieldsParameters))(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s`, async field => {
    const payload: LooseObject = { common: [], specific: [] };
    delete payload[field];

    const { statusCode, body } = await sendRequest('test', payload);

    validateMandatoryParameterResponse(field, 'body', statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if got unknown provider', async () => {
    const payload = { common: [], specific: [] };

    const { statusCode, body } = await sendRequest('UNKNOWN_TEST_CODE', payload);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown Provider',
      meta: {
        id: '{"code":"UNKNOWN_TEST_CODE"}',
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if got unknown currency', async () => {
    await DataSetBuilder.create()
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    const payload = {
      common: [],
      specific: [{
        parameters: {
          countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
          currencies: ['XXX'],
        },
        fields: [],
      }],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown currency "XXX"',
      meta: { id: 'XXX' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_CONFLICT if got duplicates in common fields', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withCountriesAuthorities({ countryIso2: 'CY' })
      .withMethod()
      .withCountryAuthorityMethod()
      .withProviderMethod({ providerId: provider.id })
      .build();
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [
        {
          key: 'key_1',
          defaultValue: '',
          fieldType: FieldValueType.STRING,
          transactionType: TransactionType.DEPOSIT,
          pattern: DEFAULT_FIELD_PATTERN,
          isEnabled: true,
          isMandatory: true,
          options: [],
        },
        {
          key: 'key_1',
          defaultValue: '',
          fieldType: FieldValueType.STRING,
          transactionType: TransactionType.DEPOSIT,
          pattern: DEFAULT_FIELD_PATTERN,
          isEnabled: true,
          isMandatory: true,
          options: [],
        },
      ],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'Common fields contain duplicates',
      meta: { id: 'key_1:deposit' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_CONFLICT if got duplicates in common field options', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withCountriesAuthorities({ countryIso2: 'CY' })
      .withMethod()
      .withCountryAuthorityMethod()
      .withProviderMethod({ providerId: provider.id })
      .build();
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [
        {
          key: 'key_1',
          defaultValue: '',
          fieldType: FieldValueType.STRING,
          transactionType: TransactionType.DEPOSIT,
          pattern: DEFAULT_FIELD_PATTERN,
          isEnabled: true,
          isMandatory: true,
          options: [
            { key: 'option_new_key_1', value: 'option_val_1', isEnabled: true },
            { key: 'option_new_key_1', value: 'option_val_1', isEnabled: false },
          ],
        },
      ],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'Field options contain duplicates',
      meta: { id: 'option_new_key_1' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should remove all fields', async () => {
    const {
      provider,
      providerMethod,
    } = await DataSetBuilder.create()
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    await Promise.all([
      DataSetBuilder.create()
        .withField({
          entityId: providerMethod.id,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'specific_key_1',
          value: 'specific_name_old_1',
          transactionType: TransactionType.DEPOSIT,
        })
        .withFieldOption({ key: 'option_old_key_1', value: 'option_val_1', isEnabled: true })
        .build(),
      DataSetBuilder.create()
        .withField({
          entityId: provider.id,
          entityType: FieldEntityType.PROVIDER,
          key: 'key_1',
          value: 'key_1',
          transactionType: TransactionType.DEPOSIT,
        })
        .withFieldOption({ key: 'option_old_key_1', value: 'option_val_1', isEnabled: true })
        .build(),
    ]);
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);
    const dbFields = await dbSelect(DbTable.cpFields, {});
    const dbOptions = await dbSelect(DbTable.cpFieldOptions, {});

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
    expect(dbFields).toStrictEqual([]);
    expect(dbOptions).toStrictEqual([]);
  });

  it('Should create fields and remove those that have not been represented in request', async () => {
    const {
      providerMethod,
      provider,
    } = await DataSetBuilder.create()
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    const [
      { field: rmField1 },
      { field: rmField2 },
      { field: rmField3 },
    ] = await Promise.all([
      DataSetBuilder.create()
        .withField({
          entityId: provider.id,
          entityType: FieldEntityType.PROVIDER,
          key: 'rm_key_1',
        })
        .build(),
      DataSetBuilder.create()
        .withField({
          entityId: providerMethod.id,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'rm_specific_key_1',
        })
        .build(),
      DataSetBuilder.create()
        .withField({
          entityId: providerMethod.id,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'rm_specific_key_2',
        })
        .build(),
      DataSetBuilder.create()
        .withField({
          entityId: providerMethod.id,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'specific_key_1',
          value: 'specific_name_old_1',
          transactionType: TransactionType.DEPOSIT,
        })
        .withFieldOption({ key: 'option_old_key_1', value: 'option_val_1', isEnabled: true })
        .build(),
    ]);
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [{
        key: 'key_1',
        defaultValue: '',
        fieldType: FieldValueType.STRING,
        transactionType: TransactionType.DEPOSIT,
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: true,
        isMandatory: true,
        options: [{ key: 'option_new_key_1', value: 'option_val_1', isEnabled: true }],
      }],
      specific: [{
        parameters: {
          countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
          currencies: [],
        },
        fields: [{
          key: 'specific_key_1',
          defaultValue: '',
          fieldType: FieldValueType.STRING,
          transactionType: TransactionType.DEPOSIT,
          pattern: DEFAULT_FIELD_PATTERN,
          isEnabled: true,
          isMandatory: true,
          options: [{ key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true }],
        }],
      }],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);
    const dbFields = await dbSelect(DbTable.cpFields, {});

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
    expect(dbFields.filter(f => [rmField1.id, rmField2.id, rmField3.id].includes(f.id))).toStrictEqual([]);
  });

  it.each(UNSUPPORTED_KEY_SYMBOLS)('Should throw ERR_VALIDATION_REQUEST if key is %s', async key => {
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [{
        key,
        name: 'name_new_1',
        defaultValue: '',
        fieldType: FieldValueType.STRING,
        transactionType: TransactionType.DEPOSIT,
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: true,
        isMandatory: true,
        options: [{ key, value: 'option_val_1', isEnabled: true }],
      }],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: { details: expect.stringMatching(`must match pattern`) },
    });
  });

  it('Should create fields for each country-authority and currency', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withCountriesAuthorities({ countryIso2: 'CY' })
      .withMethod()
      .withCountryAuthorityMethod()
      .withProviderMethod({ providerId: provider.id })
      .build();
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [{
        key: 'key_1',
        defaultValue: '',
        fieldType: FieldValueType.STRING,
        transactionType: TransactionType.DEPOSIT,
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: true,
        isMandatory: true,
        options: [{ key: 'option_new_key_1', value: 'option_val_1', isEnabled: true }],
      }],
      specific: [
        {
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: [],
          },
          fields: [{
            key: 'specific_key_null',
            defaultValue: '',
            fieldType: FieldValueType.STRING,
            transactionType: TransactionType.DEPOSIT,
            pattern: DEFAULT_FIELD_PATTERN,
            isEnabled: true,
            isMandatory: true,
            options: [{ key: 'specific_option_key_null', value: 'specific_option_val_null', isEnabled: true }],
          }],
        },
        {
          parameters: {
            countriesAuthorities: [
              { country: 'CY', authority: 'CYSEC' },
              { country: 'CY', authority: 'GM' },
            ],
            currencies: ['EUR', 'USD'],
          },
          fields: [
            {
              key: 'specific_key_1',
              defaultValue: '',
              fieldType: FieldValueType.STRING,
              transactionType: TransactionType.DEPOSIT,
              pattern: DEFAULT_FIELD_PATTERN,
              isEnabled: true,
              isMandatory: true,
              options: [{ key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true }],
            },
            {
              key: 'specific_key_1',
              name: '',
              fieldType: FieldValueType.STRING,
              transactionType: TransactionType.PAYOUT,
              pattern: DEFAULT_FIELD_PATTERN,
              isEnabled: true,
              isMandatory: true,
              options: [{ key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true }],
            },
          ],
        },
      ],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);
    const [dbFields, dbOptions] = await Promise.all([
      dbSelect(DbTable.cpFields, {}),
      dbSelect(DbTable.cpFieldOptions, {}),
    ]);

    expect(statusCode).toBe(200);
    expect(body).toEqual(payload);
    expect(dbFields.filter(f => f.key === 'specific_key_1')).toHaveLength(8);
    expect(dbOptions.filter(o => o.key === 'specific_option_key_1')).toHaveLength(8);
    expect(dbFields.filter(f => f.key === 'specific_key_null')).toHaveLength(1);
    expect(dbOptions.filter(o => o.key === 'specific_option_key_null')).toHaveLength(1);
  });

  it('Should throw ERR_CONFLICT on duplicates by key', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withCountriesAuthorities({ countryIso2: 'CY' })
      .withMethod()
      .withCountryAuthorityMethod()
      .withProviderMethod({ providerId: provider.id })
      .build();
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [],
      specific: [
        {
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: ['EUR'],
          },
          fields: [
            {
              key: 'specific_key_1',
              name: '',
              defaultValue: 'specific_val_1',
              fieldType: FieldValueType.STRING,
              transactionType: TransactionType.DEPOSIT,
              pattern: '.+',
              isEnabled: true,
              isMandatory: true,
              options: [],
            },
            {
              key: 'specific_keY_1',
              name: '',
              defaultValue: 'specific_val_1',
              fieldType: FieldValueType.STRING,
              transactionType: TransactionType.DEPOSIT,
              pattern: '.+',
              isEnabled: true,
              isMandatory: true,
              options: [],
            },
          ],
        },
      ],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'Specific fields contain duplicates',
      meta: { id: 'specific_key_1:deposit:cy:cysec:eur' },
      requestId: expect.toBeGUID(),
    });
  });

  it.each(SUPPORTED_SYMBOLS)('Should throw ERR_CONFLICT on duplicates between specific field groups', async key => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withCountriesAuthorities({ countryIso2: 'CY' })
      .withMethod()
      .withCountryAuthorityMethod()
      .withProviderMethod({ providerId: provider.id })
      .build();
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [],
      specific: [
        {
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: ['EUR'],
          },
          fields: [{
            key,
            defaultValue: '',
            fieldType: FieldValueType.STRING,
            transactionType: TransactionType.DEPOSIT,
            pattern: '.+',
            isEnabled: true,
            isMandatory: true,
            options: [],
          }],
        },
        {
          parameters: {
            countriesAuthorities: [
              { country: 'CY', authority: 'CYSEC' },
              { country: 'CY', authority: 'GM' },
            ],
            currencies: ['EUR'],
          },
          fields: [
            {
              key,
              defaultValue: '',
              fieldType: FieldValueType.STRING,
              transactionType: TransactionType.DEPOSIT,
              pattern: '.+',
              isEnabled: true,
              isMandatory: true,
              options: [],
            },
          ],
        },
      ],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'Specific fields contain duplicates',
      meta: { id: `${key}:deposit:cy:cysec:eur` },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION if got withdrawal field without name', async () => {
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    const payload = {
      common: [{
        key: 'key_1',
        fieldType: FieldValueType.STRING,
        transactionType: TransactionType.PAYOUT,
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: true,
        isMandatory: true,
        options: [],
      }],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(422);
    expect(body).toMatchObject({
      code: 'ERR_VALIDATION',
      message: 'Withdrawal field must have `name` property',
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if got withdrawal field with defaultValue', async () => {
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .build();
    const payload: UpsertProviderFieldsServiceReqBody = {
      common: [{
        key: 'key_1',
        name: 'name_1',
        defaultValue: 'qwe',
        fieldType: FieldValueType.STRING,
        transactionType: TransactionType.PAYOUT,
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: true,
        isMandatory: true,
        options: [],
      }],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    expect(statusCode).toBe(422);
    expect(body).toMatchObject({
      code: 'ERR_VALIDATION',
      message: 'Withdrawal field can\'t have `defaultValue` property',
      requestId: expect.toBeGUID(),
    });
  });
});
