import { FieldOptionUpdateDto, FieldWithOptionsDto, UpsertProviderFieldsServiceReqBody } from '@domains/providers/types';
import { TransactionType } from '@core';

import { UpsertProviderFieldsValidator } from './upsert-provider-fields-validator';

describe('UpsertProviderFieldsValidator', () => {
  describe('#validatePayload', () => {
    it('Should throw an error if currencies contain duplicates', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [],
        specific: [
          {
            parameters: {
              countriesAuthorities: [],
              currencies: ['USD', 'UsD'],
            },
            fields: [],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: [] }))
        .toThrow('Currencies list contain duplicates');
    });

    it('Should throw an error if countriesAuthorities contain duplicates', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [],
        specific: [
          {
            parameters: {
              countriesAuthorities: [
                { country: 'Ar', authority: 'GM' },
                { country: 'AR', authority: 'GM' },
              ],
              currencies: ['USD'],
            },
            fields: [],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: [] }))
        .toThrow('Country-Authorities contain duplicates');
    });

    it('Should throw an error if common fields contain duplicated keys', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [
          mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
          mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
        ],
        specific: [],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: [] }))
        .toThrow('Common fields contain duplicates');
    });

    it('Should throw an error if common fields contain duplicated keys in another case', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [
          mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
          mock<FieldWithOptionsDto>({ key: 'keY_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
        ],
        specific: [],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: [] }))
        .toThrow('Common fields contain duplicates');
    });

    it('Should throw an error if specific fields contain duplicated keys', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [],
        specific: [
          {
            parameters: {
              countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
              currencies: ['USD'],
            },
            fields: [
              mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
              mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
            ],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: [] }))
        .toThrow('Specific fields contain duplicates');
    });

    it('Should throw an error if specific fields contain duplicated keys in another case', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [],
        specific: [
          {
            parameters: {
              countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
              currencies: ['USD'],
            },
            fields: [
              mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
              mock<FieldWithOptionsDto>({ key: 'keY_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
            ],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: [] }))
        .toThrow('Specific fields contain duplicates');
    });

    it('Should throw an error if options contain duplicated keys', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [],
        specific: [
          {
            parameters: {
              countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
              currencies: ['USD'],
            },
            fields: [
              mock<FieldWithOptionsDto>({
                key: 'key_1',
                name: 'name_1',
                transactionType: TransactionType.PAYOUT,
                options: [
                  mock<FieldOptionUpdateDto>({ key: 'option_key_1' }),
                  mock<FieldOptionUpdateDto>({ key: 'option_key_1' }),
                ],
              }),
            ],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: [] }))
        .toThrow('Field options contain duplicates');
    });

    it('Shouldn\'t throw an error', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [
          mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
          mock<FieldWithOptionsDto>({ key: 'key_2', transactionType: TransactionType.PAYOUT, name: 'test', options: [] }),
        ],
        specific: [
          {
            parameters: {
              countriesAuthorities: [{ country: 'AR', authority: 'GM' }],
              currencies: ['USD'],
            },
            fields: [
              mock<FieldWithOptionsDto>({ key: 'key_1', transactionType: TransactionType.DEPOSIT, defaultValue: '', options: [] }),
              mock<FieldWithOptionsDto>({ key: 'key_2', transactionType: TransactionType.PAYOUT, name: 'test', options: [] }),
            ],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validate(payload, { currencies: ['usd'] }))
        .not.toThrow();
    });
  });
  describe('#validateFieldsCount', () => {
    it('Should throw MaxAllowedFieldsExceededError if got more than 35k of fields', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [],
        specific: [
          {
            parameters: {
              countriesAuthorities: new Array(36),
              currencies: new Array(1000),
            },
            fields: [
              mock<FieldWithOptionsDto>({ key: 'key_1', options: [] }),
            ],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validateFieldsCount(payload))
        .toThrow('Exceeded maximum allowed fields');
    });

    it('Should not throw MaxAllowedFieldsExceededError if got less than 35k of fields', () => {
      const payload: UpsertProviderFieldsServiceReqBody = {
        common: [],
        specific: [
          {
            parameters: {
              countriesAuthorities: new Array(33),
              currencies: new Array(1000),
            },
            fields: [
              mock<FieldWithOptionsDto>({ key: 'key_1', options: [] }),
            ],
          },
        ],
      };

      expect(() => UpsertProviderFieldsValidator.validateFieldsCount(payload))
        .not.toThrow();
    });
  });
});
