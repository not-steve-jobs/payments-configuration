import casual from 'casual';

import { ConfigFieldWithOptionDto, DEFAULT_FIELD_PATTERN, FieldEntityType, TransactionType } from '@core';
import { DepositConfigField, DepositConfigFieldOption } from '@domains/interop';

import { DepositConfigFieldsFactory } from './deposit-config-fields-factory';

const generateFieldWithOptionDto = (options?: Partial<ConfigFieldWithOptionDto>): ConfigFieldWithOptionDto => ({
  entityId: casual.uuid,
  entityType: FieldEntityType.PROVIDER_METHOD,
  key: 'key',
  value: null,
  defaultValue: 'value',
  valueType: 'type',
  transactionType: TransactionType.DEPOSIT,
  isMandatory: true,
  isEnabled: true,
  pattern: 'pattern',
  optionId: casual.uuid,
  optionKey: 'optionKey',
  optionValue: 'optionValue',
  optionIsEnabled: true,
  currencyIso3: '',
  ...options,
});

const generateDepositConfigField = (options?: Partial<DepositConfigField>): DepositConfigField => ({
  key: 'key',
  value: 'value',
  type: 'type',
  required: true,
  pattern: 'pattern',
  options: [],
  ...options,
});

const generateDepositConfigFieldOption = (options?: Partial<DepositConfigFieldOption>): DepositConfigFieldOption  => ({
  key: 'optionKey',
  value: 'optionValue',
  ...options,
});

describe('DepositConfigFieldsFactory', () => {
  it('Should create empty configs map', () => {
    const fieldsWithOptions: ConfigFieldWithOptionDto[] = [];

    const result = DepositConfigFieldsFactory.createDepositFieldMap(fieldsWithOptions);

    expect(result.size).toBe(0);
  });

  it('Should create single field with one option', () => {
    const fieldWithOption = generateFieldWithOptionDto();
    const expectedPMId = fieldWithOption.entityId;
    const expectedField = generateDepositConfigField({
      options: [generateDepositConfigFieldOption()],
    });

    const result = DepositConfigFieldsFactory.createDepositFieldMap([fieldWithOption]);

    expect(result.size).toBe(1);
    expect(result.get(expectedPMId)).toStrictEqual([expectedField]);
  });

  it('Should create single field with multiple options', () => {
    const fieldWithOption1 = generateFieldWithOptionDto();
    const fieldWithOption2 = generateFieldWithOptionDto({
      entityId: fieldWithOption1.entityId,
      optionKey: 'optionKey2',
    });
    const expectedPMId = fieldWithOption1.entityId;
    const expectedField = generateDepositConfigField({
      options: [
        generateDepositConfigFieldOption(),
        generateDepositConfigFieldOption({ key: 'optionKey2' }),
      ],
    });

    const result = DepositConfigFieldsFactory.createDepositFieldMap([
      fieldWithOption1, fieldWithOption2,
    ]);

    expect(result.size).toBe(1);
    expect(result.get(expectedPMId)).toStrictEqual([expectedField]);
  });

  it('Should create two fields with one option each', () => {
    const fieldWithOption1 = generateFieldWithOptionDto();
    const fieldWithOption2 = generateFieldWithOptionDto({
      entityId: fieldWithOption1.entityId,
      key: 'key2',
    });
    const expectedPMId = fieldWithOption1.entityId;
    const expectedField1 = generateDepositConfigField({
      options: [
        generateDepositConfigFieldOption(),
      ],
    });
    const expectedField2 = generateDepositConfigField({
      key: 'key2',
      options: [
        generateDepositConfigFieldOption(),
      ],
    });

    const result = DepositConfigFieldsFactory.createDepositFieldMap([
      fieldWithOption1, fieldWithOption2,
    ]);

    expect(result.size).toBe(1);
    expect(result.get(expectedPMId)).toStrictEqual([expectedField1, expectedField2]);
  });

  it('Should create fields with no options', () => {
    const fieldWithOption: ConfigFieldWithOptionDto = generateFieldWithOptionDto({
      optionKey: undefined,
    });
    const providerMethodId = fieldWithOption.entityId;
    const expectedField = generateDepositConfigField();

    const result = DepositConfigFieldsFactory.createDepositFieldMap([fieldWithOption]);

    expect(result.size).toBe(1);
    expect(result.get(providerMethodId)).toStrictEqual([expectedField]);
  });

  it('Should create one field for two providers', () => {
    const fieldWithOption1: ConfigFieldWithOptionDto = generateFieldWithOptionDto({
      optionId: undefined,
      optionKey: undefined,
    });
    const fieldWithOption2 = generateFieldWithOptionDto({
      key: 'key2',
      optionId: undefined,
      optionKey: undefined,
    });
    const expectedField1 = generateDepositConfigField();
    const expectedField2 = generateDepositConfigField({ key: 'key2' });

    const result = DepositConfigFieldsFactory.createDepositFieldMap([
      fieldWithOption1, fieldWithOption2,
    ]);

    expect(result.size).toBe(2);
    expect(result.get(fieldWithOption1.entityId)).toStrictEqual([expectedField1]);
    expect(result.get(fieldWithOption2.entityId)).toStrictEqual([expectedField2]);
  });

  it('Should return .+ if pattern is empty', () => {
    const patternNullableField = generateFieldWithOptionDto({
      key: 'key2',
      optionId: undefined,
      optionKey: undefined,
      pattern: '',
    });

    const map = DepositConfigFieldsFactory.createDepositFieldMap([patternNullableField]);

    expect(map.size).toBe(1);
    expect(map.get(patternNullableField.entityId)![0].pattern).toBe(DEFAULT_FIELD_PATTERN);
  });
});
