import {
  DEFAULT_FIELD_PATTERN,
  Field,
  FieldDto,
  FieldOption,
  Option,
  ProviderFieldsEntity,
} from '@core';

export class ConfigFieldsMapper {
  private static getCommonAndSpecificFields(providerFields: ProviderFieldsEntity[], currencyIso3: string): {
    commonFields: ProviderFieldsEntity[];
    specificFields: ProviderFieldsEntity[];
  } {
    const commonFields: ProviderFieldsEntity[] = [];
    const specificFields: ProviderFieldsEntity[] = [];

    for (const providerField of providerFields) {
      if (!(providerField.countryIso2 || providerField.authorityFullCode || providerField.currencyIso3)) {
        commonFields.push(providerField);
        continue;
      }

      // Fields with currencyIso3 NULL should be replaced with fields with specific currency
      if (!providerField.currencyIso3) {
        specificFields.unshift(providerField);
      } else if (providerField.currencyIso3 === currencyIso3) {
        specificFields.push(providerField);
      }
    }

    return { commonFields, specificFields };
  }

  private static buildFieldDto(field: Field): FieldDto {
    return {
      key: field.key,
      name: 'name' in field ? field.name : '',
      type: field.valueType,
      required: field.isMandatory,
      validation: field.pattern || DEFAULT_FIELD_PATTERN,
      options: this.buildFieldOptionsDto(field.options),
    };
  }

  private static buildFieldOptionsDto(options?: Option[]): FieldOption[] {
    if (!options) {
      return [];
    }

    const optionsToReturn: FieldOption[] = [];

    for (const option of options) {
      if (option.isEnabled) {
        optionsToReturn.push({ key: option.key, description: option.value, enabled: option.isEnabled });
      }
    }

    return optionsToReturn;
  }

  public static mapToFieldsDto(providerFields: ProviderFieldsEntity[], currencyIso3: string): FieldDto[] {
    const { commonFields, specificFields } = this.getCommonAndSpecificFields(providerFields, currencyIso3);
    const fieldsToReturnMap = new Map<string, FieldDto>();

    // Common fields should be overwritten by specific
    for (const arrayOfProviderFields of [commonFields, specificFields]) {
      for (const pf of arrayOfProviderFields) {
        const fields: Field[] = JSON.parse(pf.fields);

        for (const field of fields) {
          if (!field.isEnabled) {
            continue;
          }

          const fieldDto = this.buildFieldDto(field);
          fieldsToReturnMap.set(field.key, fieldDto);
        }
      }
    }

    return Array.from(fieldsToReturnMap.values());
  }
}
