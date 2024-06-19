import { DEFAULT_FIELD_PATTERN, FieldValueType, TransactionType } from '@core';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

import { sendGetConfigsRequest, sendGetFieldsRequest, sendUpdateFieldsRequest } from '../api-requests';

describe('UpdateSpecificFields', () => {
  beforeEach(async () => await cleanUp());

  it.each([
    { transactionType: TransactionType.PAYOUT, name: 'name', defaultValue: undefined },
    { transactionType: TransactionType.DEPOSIT, name: undefined, defaultValue: '***' },
  ])('Should add/remove $transactionType field in interop API response after update', async ({ transactionType, name, defaultValue }) => {
    { // add a field via updateFields and check that it is appeared in GET /api/interop/configs
      await DataSetBuilder.create()
        .withCurrency({ iso3: 'USD' })
        .withMethod({ code: 'cards' })
        .withProvider({ code: 'stripe', isEnabled: true })
        .withCountry({ iso2: 'CY' })
        .withAuthority({ fullCode: 'CYSEC' })
        .withCountriesAuthorities()
        .withCountryAuthorityMethod({ isEnabled: true })
        .withProviderMethod({ isEnabled: true })
        .withTransactionConfig({ type: transactionType, currencyIso3: 'USD', isEnabled: true })
        .build();
      const createPayload = {
        common: [],
        specific: [{
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: [],
          },
          fields: [{
            key: 'key_1',
            name,
            defaultValue,
            fieldType: FieldValueType.STRING,
            transactionType,
            pattern: DEFAULT_FIELD_PATTERN,
            isEnabled: true,
            isMandatory: true,
            options: [{ key: 'option_key_1', value: 'option_val_1', isEnabled: true }],
          }],
        }],
      };

      await sendUpdateFieldsRequest('stripe', createPayload);
      const [
        { status: configAfterCreateStatus, body: configAfterCreate },
        { status: getFieldsAfterCreateStatus, body: getFieldsAfterCreate },
      ] = await Promise.all([
        sendGetConfigsRequest({ country: 'CY', authority: 'CYSEC' }),
        sendGetFieldsRequest('stripe'),
      ]);

      expect(configAfterCreateStatus).toBe(200);
      expect(getFieldsAfterCreateStatus).toBe(200);
      expect(getFieldsAfterCreate).toEqual(createPayload);
      expect(configAfterCreate).toHaveLength(1);
      expect(configAfterCreate[0].providers[0][`${transactionType}Settings`].fields).toHaveLength(1);
      expect(configAfterCreate[0].providers[0][`${transactionType}Settings`].fields[0]).toStrictEqual({
        key: 'key_1',
        name: name ?? '',
        type: FieldValueType.STRING,
        validation: DEFAULT_FIELD_PATTERN,
        required: true,
        options: [{ key: 'option_key_1', description: 'option_val_1', enabled: true }],
      });
    }

    { // remove a field via updateFields and check that it is disappeared in GET /api/interop/configs
      const removePayload = {
        common: [],
        specific: [{
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: [],
          },
          fields: [],
        }],
      };

      await sendUpdateFieldsRequest('stripe', removePayload);
      const [
        { status: configAfterRemoveStatus, body: configAfterRemove },
        { status: getFieldsAfterRemoveStatus, body: getFieldsAfterRemove },
      ] = await Promise.all([
        sendGetConfigsRequest({ country: 'CY', authority: 'CYSEC' }),
        sendGetFieldsRequest('stripe'),
      ]);

      expect(configAfterRemoveStatus).toBe(200);
      expect(getFieldsAfterRemoveStatus).toBe(200);
      expect(getFieldsAfterRemove).toStrictEqual({ common: [], specific: [] });
      expect(configAfterRemove).toHaveLength(1);
      expect(configAfterRemove[0].providers[0][`${transactionType}Settings`].fields).toHaveLength(0);
    }
  });
});
