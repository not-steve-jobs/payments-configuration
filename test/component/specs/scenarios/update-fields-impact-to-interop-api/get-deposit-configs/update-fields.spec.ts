import { DEFAULT_FIELD_PATTERN, FieldValueType, ProviderType, TransactionType } from '@core';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

import { sendGetDepositConfigsRequest, sendGetFieldsRequest, sendUpdateFieldsRequest } from '../api-requests';

describe('UpdateFields', () => {
  beforeEach(async () => await cleanUp());

  it.each([
    'common',
    'specific',
  ])('Should add/remove %s deposit field in interop API response after mapping/unmapping it via updateFields', async fieldBound => {
    { // create a field and check that it is appeared in GET /api/interop/configs
      await DataSetBuilder.create()
        .withCurrency({ iso3: 'USD' })
        .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
        .withProvider({ code: 'stripe', isEnabled: true })
        .withCountry({ iso2: 'CY' })
        .withAuthority({ fullCode: 'CYSEC' })
        .withCountriesAuthorities()
        .withCountryAuthorityMethod({ isEnabled: true })
        .withProviderMethod({ isEnabled: true })
        .withTransactionConfig({ type: TransactionType.DEPOSIT, currencyIso3: 'USD', isEnabled: true })
        .build();
      const field = {
        key: 'key_1',
        defaultValue: 'default_1',
        fieldType: FieldValueType.STRING,
        transactionType: TransactionType.DEPOSIT,
        pattern: DEFAULT_FIELD_PATTERN,
        isEnabled: true,
        isMandatory: true,
        options: [],
      };
      const createPayload = {
        common: fieldBound === 'common' ? [field] : [],
        specific: fieldBound === 'specific' ? [{
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: [],
          },
          fields: [field],
        }] : [],
      };

      const { status: createFieldStatus } = await sendUpdateFieldsRequest('stripe', createPayload);
      const [
        { status: getDepositConfigsAfterCreateStatus, body: getDepositConfigsAfterCreate },
        { status: getFieldsAfterCreateStatus, body: getFieldsAfterCreate },
      ] = await Promise.all([
        sendGetDepositConfigsRequest({ country: 'CY', authority: 'CYSEC' }),
        sendGetFieldsRequest('stripe'),
      ]);

      expect(createFieldStatus).toBe(200);
      expect(getDepositConfigsAfterCreateStatus).toBe(200);
      expect(getFieldsAfterCreateStatus).toBe(200);
      expect(getFieldsAfterCreate).toStrictEqual(createPayload);
      expect(getDepositConfigsAfterCreate).toStrictEqual([{
        key: 'cards',
        description: 'Visa/Mastercard',
        provider: 'stripe',
        currencySettings: [
          { currency: 'USD', min: expect.any(Number), max: expect.any(Number) },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.DEFAULT,
        fields: [
          { key: 'key_1', value: 'default_1', type: 'string', required: true, pattern: '.+', options: [] },
        ],
      }]);
    }

    { // remove a field and check that it is disappeared in GET /api/interop/configs/deposits
      const unmapPayload = {
        common: [],
        specific: [],
      };

      const { status: rmFieldStatus } = await sendUpdateFieldsRequest('stripe', unmapPayload);
      const [
        { status: getDepositConfigsAfterUnmapStatus, body: getDepositConfigsAfterUnmap },
        { status: getFieldsAfterUnmapStatus, body: getFieldsAfterUnmap },
      ] = await Promise.all([
        sendGetDepositConfigsRequest({ country: 'CY', authority: 'CYSEC' }),
        sendGetFieldsRequest('stripe'),
      ]);

      expect(rmFieldStatus).toBe(200);
      expect(getDepositConfigsAfterUnmapStatus).toBe(200);
      expect(getFieldsAfterUnmapStatus).toBe(200);
      expect(getFieldsAfterUnmap).toStrictEqual(unmapPayload);
      expect(getDepositConfigsAfterUnmap).toStrictEqual([{
        key: 'cards',
        description: 'Visa/Mastercard',
        provider: 'stripe',
        currencySettings: [
          { currency: 'USD', min: expect.any(Number), max: expect.any(Number) },
        ],
        convertedCurrency: null,
        defaultCurrency: null,
        type: ProviderType.DEFAULT,
        fields: [],
      }]);
    }
  });
});
