import { DEFAULT_FIELD_PATTERN, FieldValueType, TransactionType } from '@core';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { ConfigDto } from '@domains/interop';

import { sendGetConfigsRequest, sendGetFieldsRequest, sendUpdateFieldsRequest } from '../api-requests';

describe('MapSpecificFieldsToCurrency', () => {
  beforeEach(async () => await cleanUp());

  it.each([
    { transactionType: TransactionType.PAYOUT, name: 'name', defaultValue: undefined },
    { transactionType: TransactionType.DEPOSIT, name: undefined, defaultValue: '***' },
  ])('Should add/remove $transactionType field in interop API response after update', async ({ transactionType, name, defaultValue }) => {
    { // map a field to currencies and check that it is appeared in all related currency configs in GET /api/interop/configs
      const { providerMethod } = await DataSetBuilder.create()
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
      await DataSetBuilder.create()
        .withCurrency({ iso3: 'EUR' })
        .withTransactionConfig({
          providerMethodId: providerMethod.id,
          type: transactionType,
          currencyIso3: 'EUR',
          isEnabled: true,
        })
        .build();

      const createPayload = {
        common: [],
        specific: [{
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: ['EUR', 'USD'],
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
        { status: getConfigsAfterCreateStatus, body: getConfigsAfterCreate },
        { status: getFieldsAfterCreateStatus, body: getFieldsAfterCreate },
      ] = await Promise.all([
        sendGetConfigsRequest({ country: 'CY', authority: 'CYSEC' }),
        sendGetFieldsRequest('stripe'),
      ]);

      expect(getConfigsAfterCreateStatus).toBe(200);
      expect(getFieldsAfterCreateStatus).toBe(200);
      expect(getFieldsAfterCreate).toEqual(createPayload);
      expect(getConfigsAfterCreate).toHaveLength(2);
      // eslint-disable-next-line
      getConfigsAfterCreate.forEach((c: any) => {
        expect(c.providers[0][`${transactionType}Settings`].fields).toHaveLength(1);
        expect(c.providers[0][`${transactionType}Settings`].fields[0]).toEqual({
          key: 'key_1',
          name: name ?? '',
          type: FieldValueType.STRING,
          validation: DEFAULT_FIELD_PATTERN,
          required: true,
          options: [{ key: 'option_key_1', description: 'option_val_1', enabled: true }],
        });
      });
    }

    { // unmap a field from EUR currency and check that it is disappeared in GET /api/interop/configs response
      const unmapPayload = {
        common: [],
        specific: [{
          parameters: {
            countriesAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
            currencies: ['USD'],
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

      await sendUpdateFieldsRequest('stripe', unmapPayload);
      const [
        { status: getConfigsAfterUnmapStatus, body: getConfigsAfterUnmap },
        { status: getFieldsAfterUnmapStatus, body: getFieldsAfterUnmap },
      ] = await Promise.all([
        sendGetConfigsRequest({ country: 'CY', authority: 'CYSEC' }),
        sendGetFieldsRequest('stripe'),
      ]);
      const usdConfig = getConfigsAfterUnmap.find((c: ConfigDto) => c.currency === 'USD');
      const eurConfig = getConfigsAfterUnmap.find((c: ConfigDto) => c.currency === 'EUR');

      expect(getConfigsAfterUnmapStatus).toBe(200);
      expect(getFieldsAfterUnmapStatus).toBe(200);
      expect(getFieldsAfterUnmap).toEqual(unmapPayload);
      expect(getConfigsAfterUnmap).toHaveLength(2);
      expect(eurConfig.providers[0][`${transactionType}Settings`].fields).toHaveLength(0);
      expect(usdConfig.providers[0][`${transactionType}Settings`].fields).toHaveLength(1);
      expect(usdConfig.providers[0][`${transactionType}Settings`].fields[0]).toStrictEqual({
        key: 'key_1',
        name: name ?? '',
        type: FieldValueType.STRING,
        validation: DEFAULT_FIELD_PATTERN,
        required: true,
        options: [{ key: 'option_key_1', description: 'option_val_1', enabled: true }],
      });
    }
  });
});
