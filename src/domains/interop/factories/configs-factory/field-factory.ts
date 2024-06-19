import { ConfigFieldWithOptionDto, DEFAULT_FIELD_PATTERN, FieldDto, FieldOption } from '@core';

export class FieldFactory {
  private static createMethodField(field: ConfigFieldWithOptionDto): FieldDto {
    return {
      key: field.key,
      name: field.value ?? '',
      type: field.valueType,
      required: field.isMandatory,
      validation: field.pattern || DEFAULT_FIELD_PATTERN,
      options: [],
    };
  }

  private static createMethodFieldOption(field: ConfigFieldWithOptionDto): FieldOption {
    return {
      key: field.optionKey,
      description: field.optionValue,
      enabled: field.optionIsEnabled,
    };
  }

  public static createSettingFields(
    fields: ConfigFieldWithOptionDto[],
    commonFields: ConfigFieldWithOptionDto[],
    currencyIso3: string
  ): FieldDto[] {
    const specificFields = fields.filter(field => !field.currencyIso3);
    const currencyFields = fields.filter(field => field.currencyIso3 === currencyIso3);

    const keyToField = this.createFieldMap(specificFields);
    const keyToCurrencyField = this.createFieldMap(currencyFields);
    const keyToCommonField = this.createFieldMap(commonFields);

    // override/add currency fields to the result map
    for (const [key, f] of keyToCurrencyField) {
      keyToField.set(key, f);
    }

    // add common fields to the result map if key doesn't exist
    for (const [key, f] of keyToCommonField) {
      if (!keyToField.has(key)) {
        keyToField.set(key, f);
      }
    }

    return Array.from(keyToField.values());
  }

  private static createFieldMap(fields: ConfigFieldWithOptionDto[]): Map<string, FieldDto> {
    const keyToField = new Map<string, FieldDto>;

    for (const f of fields) {
      const field = keyToField.get(f.key) ?? this.createMethodField(f);

      if (f.optionId && f.optionIsEnabled) {
        field.options.push(this.createMethodFieldOption(f));
      }

      keyToField.set(field.key, field);
    }

    return keyToField;
  }
}
