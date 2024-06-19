import casual from 'casual';

import { ConfigFieldWithOptionDto, DEFAULT_FIELD_PATTERN, FieldEntityType, TransactionType } from '@core';

import { FieldFactory } from './field-factory';

describe('FieldFactory', () => {
  describe('#createWithdrawalSettingFields', () => {
    it('Should return fields if there is no currency fields', () => {
      const payload: ConfigFieldWithOptionDto[] = [
        {
          entityId: casual.uuid,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'key_1',
          value: 'val_1',
          valueType: '1',
          transactionType: TransactionType.DEPOSIT,
          isMandatory: true,
          pattern: '(\\W|^)[\\w.\\-]{0,25}@(yahoo|hotmail|gmail)\\.com(\\W|$)',
          optionId: '1',
          optionKey: 'option_key_1',
          optionValue: 'option_val_1',
          optionIsEnabled: true,
          currencyIso3: '',
          isEnabled: true,
          defaultValue: null,
        },
      ];

      const result = FieldFactory.createSettingFields(payload, [], 'USD');

      expect(result).toStrictEqual([
        {
          key: 'key_1',
          name: 'val_1',
          type: '1',
          required: true,
          validation: '(\\W|^)[\\w.\\-]{0,25}@(yahoo|hotmail|gmail)\\.com(\\W|$)',
          options: [
            { key: 'option_key_1', description: 'option_val_1', enabled: true },
          ],
        },
      ]);
    });

    it('Should return fields with merged common and currency fields (currency fields must override common fields)', () => {
      const fields: ConfigFieldWithOptionDto[] = [
        {
          entityId: casual.uuid,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'key_1',
          value: 'val_1',
          valueType: '1',
          transactionType: TransactionType.DEPOSIT,
          isMandatory: true,
          pattern: DEFAULT_FIELD_PATTERN,
          optionId: '1',
          optionKey: 'option_key_1',
          optionValue: 'option_val_1',
          optionIsEnabled: true,
          currencyIso3: '',
          isEnabled: true,
          defaultValue: null,
        },
        {
          entityId: casual.uuid,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'key_1',
          value: 'val_1',
          valueType: '1',
          transactionType: TransactionType.DEPOSIT,
          isMandatory: false,
          pattern: DEFAULT_FIELD_PATTERN,
          optionId: '1',
          optionKey: 'option_key_1_1',
          optionValue: 'option_val_1_1',
          optionIsEnabled: false,
          currencyIso3: 'USD',
          isEnabled: true,
          defaultValue: null,
        },
        {
          entityId: casual.uuid,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'key_2',
          value: 'val_2',
          valueType: '1',
          transactionType: TransactionType.DEPOSIT,
          isMandatory: true,
          pattern: DEFAULT_FIELD_PATTERN,
          optionId: '1',
          optionKey: 'option_key_2',
          optionValue: 'option_val_2',
          optionIsEnabled: true,
          currencyIso3: 'USD',
          isEnabled: true,
          defaultValue: null,
        },
        {
          entityId: casual.uuid,
          entityType: FieldEntityType.PROVIDER_METHOD,
          key: 'key_2',
          value: 'val_2',
          valueType: '1',
          transactionType: TransactionType.DEPOSIT,
          isMandatory: true,
          pattern: DEFAULT_FIELD_PATTERN,
          optionId: '1',
          optionKey: 'option_key_2',
          optionValue: 'option_val_2',
          optionIsEnabled: true,
          currencyIso3: 'EUR',
          isEnabled: true,
          defaultValue: null,
        },
      ];
      const commonFields: ConfigFieldWithOptionDto[] = [
        {
          entityId: casual.uuid,
          entityType: FieldEntityType.PROVIDER,
          key: 'key_common_1',
          value: 'val_common_1',
          valueType: '1',
          transactionType: TransactionType.DEPOSIT,
          isMandatory: true,
          pattern: DEFAULT_FIELD_PATTERN,
          optionId: '1',
          optionKey: 'option_key_common_1',
          optionValue: 'option_val_common_1',
          optionIsEnabled: true,
          currencyIso3: 'EUR',
          isEnabled: true,
          defaultValue: null,
        },
        {
          entityId: casual.uuid,
          entityType: FieldEntityType.PROVIDER,
          key: 'key_2',
          value: 'val_common_2',
          valueType: '1',
          transactionType: TransactionType.DEPOSIT,
          isMandatory: true,
          pattern: DEFAULT_FIELD_PATTERN,
          optionId: '1',
          optionKey: 'option_key_common_2',
          optionValue: 'option_val_common_2',
          optionIsEnabled: true,
          currencyIso3: 'EUR',
          isEnabled: true,
          defaultValue: null,
        },
      ];

      const result = FieldFactory.createSettingFields(fields, commonFields, 'USD');

      expect(result).toStrictEqual([
        {
          key: 'key_1',
          name: 'val_1',
          type: '1',
          required: false,
          validation: DEFAULT_FIELD_PATTERN,
          options: [],
        },
        {
          key: 'key_2',
          name: 'val_2',
          type: '1',
          required: true,
          validation: DEFAULT_FIELD_PATTERN,
          options: [
            { key: 'option_key_2', description: 'option_val_2', enabled: true },
          ],
        },
        {
          key: 'key_common_1',
          name: 'val_common_1',
          type: '1',
          required: true,
          validation: DEFAULT_FIELD_PATTERN,
          options: [
            { key: 'option_key_common_1', description: 'option_val_common_1', enabled: true },
          ],
        },
      ]);
    });
  });
});
