import request from 'supertest';

import * as validators from '@test-component/utils/validators';
import { DEFAULT_FIELD_PATTERN, FieldValueType, TransactionType } from '@core';
import { cleanUp, getConfig, skipIf, validateMandatoryParameterResponse } from '@test-component/utils';
import { ProviderFields } from '@domains/providers/types/dtos';
import { DbTable, LooseObject, dbSelect } from '@internal/component-test-library';
import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { UpdateFieldsParameters } from '@test-component/constant';
import { DataSetBuilder } from '@test-component/data';

describe('PUT /api/providers/{code}/fields/bulk-update V2', () => {
  const config = getConfig();
  const useNewFieldsSchema = config.features?.useNewFieldsSchema ?? false;

  skipIf(!useNewFieldsSchema);

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
    const payload: ProviderFields = {
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

  it('Should throw ERR_VALIDATION if got empty countries list on specific field', async () => {
    await DataSetBuilder.create().withProvider({ code: 'stripe' }).build();

    const payload = {
      common: [],
      specific: [
        {
          parameters: {
            countriesAuthorities: [],
            currencies: [],
          },
          fields: [],
        },
      ],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);

    validators.validateMustNotHaveFewerItemsThan('specific/0/parameters/countriesAuthorities', 1, statusCode, body);
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
    const payload: ProviderFields = {
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
    const payload: ProviderFields = {
      common: [
        {
          key: 'key_1',
          name: 'name_new_1',
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
    const { provider } = await DataSetBuilder.create()
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
        .withProviderField({
          providerCode: provider.code,
          countryIso2: 'AR',
          authorityFullCode: 'GM',
          currencyIso3: null,
          transactionType: TransactionType.DEPOSIT,
          fields: JSON.stringify([{
            key: 'specific_key_1',
            valueType: 'string',
            defaultValue: '',
            pattern: DEFAULT_FIELD_PATTERN,
            isMandatory: true,
            isEnabled: true,
            options: [ { key: 'option_old_key_1', value: 'option_val_1', isEnabled: true } ],
          }]),
        })
        .build(),
      DataSetBuilder.create()
        .withProviderField({
          providerCode: provider.code,
          countryIso2: null,
          authorityFullCode: null,
          currencyIso3: null,
          transactionType: TransactionType.DEPOSIT,
          fields: JSON.stringify([{
            key: 'key_1',
            valueType: 'string',
            defaultValue: '',
            pattern: DEFAULT_FIELD_PATTERN,
            isMandatory: true,
            isEnabled: true,
            options: [ { key: 'option_old_key_1', value: 'option_val_1', isEnabled: true } ],
          }]),
        })
        .build(),
    ]);
    const payload: ProviderFields = {
      common: [],
      specific: [],
    };

    const { statusCode, body } = await sendRequest('stripe', payload);
    const dbProviderFields = await dbSelect(DbTable.cpProviderFields, {});

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
    expect(dbProviderFields).toStrictEqual([]);
  });

  it('Should create fields and remove those that have not been represented in request', async () => {
    const { provider } = await DataSetBuilder.create()
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
        .withProviderField({
          providerCode: provider.code,
          countryIso2: null,
          authorityFullCode: null,
          currencyIso3: null,
          transactionType: TransactionType.DEPOSIT,
          fields: JSON.stringify([
            {
              key: 'key_1',
              valueType: 'string',
              defaultValue: '',
              pattern: DEFAULT_FIELD_PATTERN,
              isMandatory: true,
              isEnabled: true,
              options: [],
            },
            {
              key: 'rm_key_1',
              valueType: 'string',
              defaultValue: '',
              pattern: DEFAULT_FIELD_PATTERN,
              isMandatory: true,
              isEnabled: true,
              options: [],
            },
          ]),
        })
        .build(),
      DataSetBuilder.create()
        .withProviderField({
          providerCode: provider.code,
          countryIso2: 'AR',
          authorityFullCode: 'GM',
          currencyIso3: null,
          transactionType: TransactionType.DEPOSIT,
          fields: JSON.stringify([
            {
              key: 'specific_key_1',
              valueType: 'string',
              defaultValue: '',
              pattern: DEFAULT_FIELD_PATTERN,
              isMandatory: true,
              isEnabled: true,
              options: [ { key: 'option_old_key_1', value: 'option_val_1', isEnabled: true } ],
            },
            {
              key: 'rm_specific_key_1',
              valueType: 'string',
              defaultValue: '',
              pattern: DEFAULT_FIELD_PATTERN,
              isMandatory: true,
              isEnabled: true,
              options: [],
            },
            {
              key: 'rm_specific_key_2',
              valueType: 'string',
              defaultValue: '',
              pattern: DEFAULT_FIELD_PATTERN,
              isMandatory: true,
              isEnabled: true,
              options: [],
            },
          ]),
        })
        .build(),
    ]);
    const payload: ProviderFields = {
      common: [{
        key: 'key_1',
        defaultValue: 'val_new_1',
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
          defaultValue: 'specific_val_new_1',
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
    const dbFields = await dbSelect(DbTable.cpProviderFields, {});
    const common = dbFields.filter(f => f.countryIso2 === null);
    const specific = dbFields.filter(f => !!f.countryIso2);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
    expect(common).toHaveLength(1);
    const commonFields = JSON.parse(common[0].fields);
    expect(commonFields).toHaveLength(1);
    expect(commonFields[0]).toStrictEqual({
      key: 'key_1',
      valueType: 'string',
      defaultValue: 'val_new_1',
      pattern: DEFAULT_FIELD_PATTERN,
      isMandatory: true,
      isEnabled: true,
      options: [{ key: 'option_new_key_1', value: 'option_val_1', isEnabled: true }],
    });
    expect(specific).toHaveLength(1);
    const specificFields = JSON.parse(specific[0].fields);
    expect(specificFields).toHaveLength(1);
    expect(specificFields[0]).toStrictEqual({
      key: 'specific_key_1',
      valueType: 'string',
      defaultValue: 'specific_val_new_1',
      pattern: DEFAULT_FIELD_PATTERN,
      isMandatory: true,
      isEnabled: true,
      options: [ { key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true } ],
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
    const payload: ProviderFields = {
      common: [{
        key: 'key_1',
        defaultValue: 'val_new_1',
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
            name: 'specific_name_new_null',
            fieldType: FieldValueType.SELECT,
            transactionType: TransactionType.PAYOUT,
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
              key: 'specific_key_payout_1',
              name: 'specific_name_new_1',
              fieldType: FieldValueType.STRING,
              transactionType: TransactionType.PAYOUT,
              pattern: DEFAULT_FIELD_PATTERN,
              isEnabled: true,
              isMandatory: true,
              options: [],
            },
            {
              key: 'specific_key_refund_1',
              name: 'specific_name_new_1',
              fieldType: FieldValueType.SELECT,
              transactionType: TransactionType.REFUND,
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

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
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
    const payload: ProviderFields = {
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

  it('Should throw ERR_CONFLICT on duplicates between specific field groups', async () => {
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
    const payload: ProviderFields = {
      common: [],
      specific: [
        {
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: ['EUR'],
          },
          fields: [{
            key: 'specific_key_1',
            name: '',
            defaultValue: 'specific_val_1',
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
});
