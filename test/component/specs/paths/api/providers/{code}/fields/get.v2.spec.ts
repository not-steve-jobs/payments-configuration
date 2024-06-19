import request from 'supertest';

import { cleanUp, getConfig, skipIf } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { DEFAULT_FIELD_PATTERN, TransactionType } from '@core';


describe('GET /api/providers/{code}/fields V2', () => {
  const config = getConfig();
  const useNewFieldsSchema = config.features?.useNewFieldsSchema ?? false;

  skipIf(!useNewFieldsSchema);

  beforeEach(async () => await cleanUp());

  const sendRequest = (code: string): request.Test =>
    request(baseUrl)
      .get(`api/providers/${code}/fields`)
      .withAuth();

  it('Should return empty list for non existing provider', async () => {
    const { statusCode, body } = await sendRequest('UNKNOWN_TEST_CODE');

    expect(statusCode).toBe(200);
    expect(body).toEqual({ common: [], specific: [] });
  });

  it('Should return empty list for provider without fields', async () => {
    const { provider } = await DataSetBuilder.create().withProvider().build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toEqual({ common: [], specific: [] });
  });

  it('Should return common fields', async () => {
    const { provider } = await DataSetBuilder.create()
      .withProvider()
      .withProviderField({
        countryIso2: null,
        authorityFullCode: null,
        currencyIso3: null,
        transactionType: TransactionType.DEPOSIT,
        fields: JSON.stringify([{
          key: 'specific_key_1',
          valueType: 'string',
          defaultValue: 'default',
          pattern: DEFAULT_FIELD_PATTERN,
          isEnabled: false,
          isMandatory: false,
          options: [
            { key: 'option_key_1', value: 'option_val_1', isEnabled: true },
            { key: 'option_key_2', value: 'option_val_2', isEnabled: true },
          ],
        }]),
      })
      .build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toEqual({
      common: [{
        key: 'specific_key_1',
        fieldType: 'string',
        defaultValue: 'default',
        isEnabled: false,
        isMandatory: false,
        pattern: DEFAULT_FIELD_PATTERN,
        transactionType: TransactionType.DEPOSIT,
        options: [
          { key: 'option_key_1', value: 'option_val_1', isEnabled: true },
          { key: 'option_key_2', value: 'option_val_2', isEnabled: true },
        ],
      }],
      specific: [],
    });
  });

  it('Should return specific fields', async () => {
    const { provider } = await DataSetBuilder.create()
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod()
      .withCountriesAuthorities()
      .withCountryAuthorityMethod()
      .withProviderMethod()
      .withProviderField({
        countryIso2: 'AR',
        authorityFullCode: 'GM',
        currencyIso3: null,
        transactionType: TransactionType.DEPOSIT,
        fields: JSON.stringify([{
          key: 'specific_key_1',
          valueType: 'string',
          defaultValue: 'default',
          pattern: DEFAULT_FIELD_PATTERN,
          isEnabled: false,
          isMandatory: false,
          options: [
            { key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true },
          ],
        }]),
      })
      .build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toEqual({
      common: [], specific: [{
        parameters: {
          countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
          currencies: [],
        },
        fields: [{
          key: 'specific_key_1',
          fieldType: 'string',
          defaultValue: 'default',
          pattern: DEFAULT_FIELD_PATTERN,
          isEnabled: false,
          isMandatory: false,
          transactionType: TransactionType.DEPOSIT,
          options: [{ key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true }],
        }],
      }],
    });
  });
});
