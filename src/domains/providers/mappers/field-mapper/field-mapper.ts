import { randomUUID } from 'crypto';

import { FieldEntity, FieldEntityType, FieldOptionEntity, TransactionType, UnboundedFieldEntity } from '@core';
import { FieldOptionMapper } from '@domains/providers/mappers/field-option-mapper';
import { FieldWithOptionsDto } from '@domains/providers/types/dtos';

export class FieldMapper {
  public static createEntityModel(
    payload: FieldWithOptionsDto,
    entityId: string,
    entityType: FieldEntityType,
    currencyIso3: string | null
  ): FieldEntity {
    return {
      id: randomUUID(),
      key: payload.key,
      entityId,
      entityType,
      transactionType: payload.transactionType,
      currencyIso3: currencyIso3 || '',
      valueType: payload.fieldType,
      value: payload.name ?? null,
      defaultValue: payload.defaultValue ?? null,
      pattern: payload.pattern,
      isMandatory: payload.isMandatory,
      isEnabled: payload.isEnabled,
      adminApiId: null,
    };
  }

  public static createWithOptionsDtoList(fields: UnboundedFieldEntity[], fieldsOptions: FieldOptionEntity[]): FieldWithOptionsDto[] {
    const fieldWithOptions: FieldWithOptionsDto[] = [];

    for (const field of fields) {
      const options = fieldsOptions.filter(({ fieldId }) => field.id === fieldId);
      const fieldWithOption = FieldMapper.createWithOptionsDto(field, options);

      fieldWithOptions.push(fieldWithOption);
    }

    return fieldWithOptions;
  }

  public static createWithOptionsDto(fieldEntity: UnboundedFieldEntity, optionEntities: FieldOptionEntity[]): FieldWithOptionsDto {
    const name = fieldEntity.transactionType === TransactionType.DEPOSIT
      ? undefined
      : fieldEntity.value || '';
    const defaultValue = fieldEntity.transactionType === TransactionType.DEPOSIT
      ? fieldEntity.defaultValue || ''
      : undefined;

    return {
      key: fieldEntity.key,
      transactionType: fieldEntity.transactionType,
      fieldType: fieldEntity.valueType,
      name,
      defaultValue,
      pattern: fieldEntity.pattern,
      isMandatory: fieldEntity.isMandatory,
      isEnabled: fieldEntity.isEnabled,
      options: optionEntities.map(o => FieldOptionMapper.createDto(o)),
    };
  }
}
