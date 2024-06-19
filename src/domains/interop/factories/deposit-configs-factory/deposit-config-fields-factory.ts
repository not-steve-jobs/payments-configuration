import { ConfigFieldWithOptionDto, DEFAULT_FIELD_PATTERN } from '@core';
import { DepositConfigField, DepositConfigFieldOption } from '@domains/interop';

export class DepositConfigFieldsFactory {
  public static createDepositFieldMap(fieldWithOptionDtos: ConfigFieldWithOptionDto[]): Map<string, DepositConfigField[]> {
    const entityIdToFieldsMap = new Map<string, DepositConfigField[]>();

    for (const fieldWithOptionDto of fieldWithOptionDtos) {
      const field = this.getField(entityIdToFieldsMap, fieldWithOptionDto);

      if (!fieldWithOptionDto.optionIsEnabled) {
        continue;
      }

      const fieldOption = this.createOption(fieldWithOptionDto);
      if (fieldOption) {
        field.options.push(fieldOption);
      }
    }

    return entityIdToFieldsMap;
  }

  private static getField(entityIdToFieldsMap: Map<string, DepositConfigField[]>,
                          fieldWithOptionDto: ConfigFieldWithOptionDto): DepositConfigField {
    const fields = entityIdToFieldsMap.get(fieldWithOptionDto.entityId) || [];
    const existingField = fields.find(f => f.key === fieldWithOptionDto.key);

    if (!existingField) {
      const createdField = this.createField(fieldWithOptionDto);
      fields.push(createdField);
      entityIdToFieldsMap.set(fieldWithOptionDto.entityId, fields);
      return createdField;
    }

    return existingField;
  }

  private static createField(fieldWithOptionDto: ConfigFieldWithOptionDto): DepositConfigField {
    return {
      key: fieldWithOptionDto.key,
      value: fieldWithOptionDto.defaultValue ?? '',
      type: fieldWithOptionDto.valueType,
      required: fieldWithOptionDto.isMandatory,
      pattern: fieldWithOptionDto.pattern || DEFAULT_FIELD_PATTERN,
      options: [],
    };
  }

  private static createOption(fieldWithOptionDto: ConfigFieldWithOptionDto): DepositConfigFieldOption | null {
    if (fieldWithOptionDto.optionKey) {
      return {
        key: fieldWithOptionDto.optionKey,
        value: fieldWithOptionDto.optionValue,
      };
    }

    return null;
  }
}
