import { ConfigFieldWithOptionDto, CountryAuthorityDto, FieldOptionDto } from '@core';
import { FieldWithOptionsDto, SpecificFieldWithOptionDto, SpecificFieldsDto } from '@domains/providers';
import { createUniqueHash } from '@utils';

interface FieldGroupParameters extends CountryAuthorityDto {
  currency: string | null;
}

interface FieldGroup {
  parameters: FieldGroupParameters[];
  fields: FieldWithOptionsDto[];
}

interface CurrencyGroupParameters {
  countriesAuthorities: CountryAuthorityDto[];
  currencies: string[];
}


export class FieldWithOptionsFactory {
  public static createCommon(fieldsWithOptions: ConfigFieldWithOptionDto[]): FieldWithOptionsDto[] {
    const map = new Map<string, FieldWithOptionsDto>();

    for (const fo of fieldsWithOptions) {
      const key = `${fo.key}:${fo.transactionType}`;
      const existingField = map.get(key);
      if (existingField) {
        existingField.options.push(this.createFieldOption(fo));
        continue;
      }

      const createdField = this.createField(fo);
      if (fo.optionId) {
        createdField.options.push(this.createFieldOption(fo));
      }
      map.set(key, createdField);
    }
    return [...map.values()];
  }

  public static createSpecific(fieldsWithOptions: SpecificFieldWithOptionDto[]): SpecificFieldsDto[] {
    const fieldGroups = this.groupByFields(fieldsWithOptions);
    return this.groupByCurrencies(fieldGroups);
  }

  private static groupByFields(fieldsWithOptions: SpecificFieldWithOptionDto[]): FieldGroup[] {
    const fieldGroupsMap = new Map<string, FieldGroup>();

    let fieldGroupParams: FieldGroupParameters | null = null;
    let fields: FieldWithOptionsDto[] = [];
    let field: FieldWithOptionsDto | null = null, fieldOption: FieldOptionDto | null = null;
    for (const fo of fieldsWithOptions) {
      if (!fieldGroupParams) {
        fieldGroupParams = this.createFieldsGroupParams(fo);
      }

      if (!this.isFieldBelongToGroup(fo, fieldGroupParams) && field) {
        fields.push(field);
        this.pushFieldToGroup(fields, fieldGroupParams, fieldGroupsMap);

        field = null;
        fields = [];
        fieldGroupParams = this.createFieldsGroupParams(fo);
      }

      if (field && (fo.key !== field.key || fo.transactionType !== field.transactionType)) {
        fields.push(field);
        field = null;
      }
      if (!field && !fields.find(f => f.key === fo.key && f.transactionType === fo.transactionType)) {
        field = this.createField(fo);
      }
      if (fo.optionKey && field && !field.options.find(o => o.key === fo.optionKey)) {
        fieldOption = this.createFieldOption(fo);
        field.options.push(fieldOption);
      }
    }

    if (field && fieldGroupParams) {
      fields.push(field);
      this.pushFieldToGroup(fields, fieldGroupParams, fieldGroupsMap);
    }

    return [...fieldGroupsMap.values()];
  }

  private static groupByCurrencies(fieldGroups: FieldGroup[]): SpecificFieldsDto[] {
    const groupedFields: SpecificFieldsDto[] = [];
    const map = new Map<string | null, CurrencyGroupParameters>();
    let currencies: string[] = [];
    for (const fieldsGroup of fieldGroups) {
      let countryAuthority: CountryAuthorityDto = {
        authority: fieldsGroup.parameters[0].authority,
        country: fieldsGroup.parameters[0].country,
      };
      for (const param of fieldsGroup.parameters) {
        if (!param.currency) {
          countryAuthority = {
            authority: param.authority,
            country: param.country,
          };
          this.upsertCurrenciesGroup(countryAuthority, [], map);
          continue;
        }

        if (countryAuthority.authority !== param.authority || countryAuthority.country !== param.country) {
          this.upsertCurrenciesGroup(countryAuthority, currencies, map);
          countryAuthority = {
            authority: param.authority,
            country: param.country,
          };
          currencies = [param.currency];
        } else {
          currencies.push(param.currency);
        }
      }

      if (currencies.length) {
        this.upsertCurrenciesGroup(countryAuthority, currencies, map);
      }

      for (const group of map.values()) {
        groupedFields.push({
          parameters: group,
          fields: fieldsGroup.fields,
        });
      }

      currencies = [];
      map.clear();
    }

    return groupedFields;
  }

  private static upsertCurrenciesGroup(countryAuthority: CountryAuthorityDto,
                                       currencies: string[],
                                       map: Map<string | null, CurrencyGroupParameters>): void {
    const groupKey = createUniqueHash(currencies);
    const group = map.get(groupKey);
    if (group) {
      group.countriesAuthorities.push(countryAuthority);
    } else {
      map.set(groupKey, { countriesAuthorities: [countryAuthority], currencies });
    }
  }

  private static createField(fieldWithOption: ConfigFieldWithOptionDto | SpecificFieldWithOptionDto): FieldWithOptionsDto {
    return {
      key: fieldWithOption.key,
      transactionType: fieldWithOption.transactionType,
      fieldType: fieldWithOption.valueType,
      name: fieldWithOption.value ?? undefined,
      defaultValue: fieldWithOption.defaultValue ?? undefined,
      pattern: fieldWithOption.pattern,
      isMandatory: fieldWithOption.isMandatory,
      isEnabled: fieldWithOption.isEnabled,
      options: [],
    };
  }

  private static createFieldOption(fieldWithOption: ConfigFieldWithOptionDto | SpecificFieldWithOptionDto): FieldOptionDto {
    return {
      key: fieldWithOption.optionKey,
      value: fieldWithOption.optionValue,
      isEnabled: fieldWithOption.optionIsEnabled,
    };
  }

  private static createFieldsGroupParams (fieldWithOption: SpecificFieldWithOptionDto): FieldGroupParameters {
    return {
      country: fieldWithOption.country,
      authority: fieldWithOption.authority,
      currency: fieldWithOption.currency || null,
    };
  }
  private static isFieldBelongToGroup(fieldWithOption: SpecificFieldWithOptionDto, groupParams: FieldGroupParameters): boolean {
    const currency = fieldWithOption.currency || null;
    return groupParams.authority === fieldWithOption.authority &&
      groupParams.country === fieldWithOption.country &&
      groupParams.currency === currency;
  }

  private static pushFieldToGroup(fields: FieldWithOptionsDto[],
                                  fieldGroupParams: FieldGroupParameters,
                                  fieldGroupsMap: Map<string, FieldGroup>): void {
    const fieldsHash = createUniqueHash(fields);
    const fieldGroup = fieldGroupsMap.get(fieldsHash);
    if (fieldGroup) {
      fieldGroup.parameters.push(fieldGroupParams);
    } else {
      fieldGroupsMap.set(fieldsHash, {
        parameters: [fieldGroupParams],
        fields,
      });
    }
  }
}
