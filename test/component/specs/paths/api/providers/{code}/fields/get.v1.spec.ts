import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { DEFAULT_FIELD_PATTERN, FieldEntityType, TransactionType } from '@core';
import { getConfig, skipIf } from '@test-component/utils';

describe('GET /api/providers/{code}/fields V1', () => {
  const config = getConfig();
  const useNewFieldsSchema = config.features?.useNewFieldsSchema ?? false;

  skipIf(useNewFieldsSchema);

  beforeEach(async () => {
    await cleanUp();
  });

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
    const { provider } = await DataSetBuilder.create().withProvider().build();

    const { field } = await DataSetBuilder.create()
      .withField({
        entityId: provider.id,
        entityType: FieldEntityType.PROVIDER,
        key: 'specific_key_1',
        value: null,
        valueType: 'string',
        defaultValue: 'default',
        transactionType: TransactionType.DEPOSIT,
      })
      .withFieldOption({ key: 'option_key_1', value: 'option_val_1', isEnabled: true })
      .build();

    await DataSetBuilder.create()
      .withFieldOption({ fieldId: field.id, key: 'option_key_2', value: 'option_val_2', isEnabled: true })
      .build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toEqual({
      common: [{
        key: 'specific_key_1',
        isEnabled: false,
        isMandatory: false,
        fieldType: 'string',
        defaultValue: 'default',
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
    await DataSetBuilder.create()
      .withField({
        entityId: providerMethod.id,
        entityType: FieldEntityType.PROVIDER_METHOD,
        key: 'specific_key_1',
        value: null,
        valueType: 'string',
        defaultValue: 'default',
        transactionType: TransactionType.DEPOSIT,
      })
      .withFieldOption({ key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true })
      .build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toEqual({ common: [], specific: [{
      parameters: {
        countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
        currencies: [],
      },
      fields: [{
        key: 'specific_key_1',
        transactionType: TransactionType.DEPOSIT,
        fieldType: 'string',
        defaultValue: 'default',
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: false,
        isMandatory: false,
        options: [{ key: 'specific_option_key_1', value: 'specific_option_val_1', isEnabled: true }],
      }],
    }],
    });
  });
});
