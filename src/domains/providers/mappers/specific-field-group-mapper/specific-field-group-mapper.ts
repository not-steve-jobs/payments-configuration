import {
  FieldsWithOptions,
  FieldsWithOptionsSpecific,
  SpecificFieldsDto,
  SpecificFieldsFlatGroupDto,
} from '@domains/providers';
import { createUniqueHash } from '@utils';

import { FieldMapper } from '../field-mapper';
import { UpsertFieldMapper } from '../upsert-field-mapper';

export class SpecificFieldGroupMapper {
  public static createFlatFieldGroup(fieldInfo: FieldsWithOptionsSpecific): SpecificFieldsFlatGroupDto {
    return {
      country: fieldInfo.country,
      authority: fieldInfo.authority,
      currency: fieldInfo.currency,
      fields: FieldMapper.createWithOptionsDtoList(
        fieldInfo.fieldsWithOptionsUnbounded.fields,
        fieldInfo.fieldsWithOptionsUnbounded.options
      ),
    };
  }

  public static mergeFieldGroups(payload: SpecificFieldsFlatGroupDto[]): SpecificFieldsDto[] {
    const fieldGroupsWithCurrency = new Map<string, SpecificFieldsDto>();
    const fieldGroupWithoutCurrency = new Map<string, SpecificFieldsDto>();

    payload.forEach(fieldList => this.handleFieldGroup(
      fieldList,
      fieldList.currency ? fieldGroupsWithCurrency : fieldGroupWithoutCurrency
    ));

    return [...fieldGroupWithoutCurrency.values(), ...fieldGroupsWithCurrency.values()];
  }

  public static unwrapFieldGroupsToFlat(
    specificFieldsDto: SpecificFieldsDto[],
    providerMethodsMap: Map<string, string[]>
  ): FieldsWithOptionsSpecific[] {
    const fieldsWithOptionsSpecific: FieldsWithOptionsSpecific[] = [];

    for (const { parameters: { countriesAuthorities, currencies }, fields } of specificFieldsDto) {
      for (const  { country, authority } of countriesAuthorities) {
        for (const currency of currencies.length ? currencies : [null]) {
          const fieldsWithOptionsUnbounded = UpsertFieldMapper.createUnbounded(fields, currency);
          const fieldsWithOptions: FieldsWithOptions = { fields: [], options: [] };
          const pmIds = providerMethodsMap.get(`${country}:${authority}`)!;

          for (const id of pmIds) {
            const fieldsWithOptionsBounded = UpsertFieldMapper.createSpecific(id, currency, fields);

            fieldsWithOptions.fields = [...fieldsWithOptions.fields, ...fieldsWithOptionsBounded.fields];
            fieldsWithOptions.options = [...fieldsWithOptions.options, ...fieldsWithOptionsBounded.options];
          }

          fieldsWithOptionsSpecific.push({ country, authority, currency, fieldsWithOptionsUnbounded, fieldsWithOptions });
        }
      }
    }

    return fieldsWithOptionsSpecific;
  }

  private static handleFieldGroup(fieldList: SpecificFieldsFlatGroupDto, fieldGroupsMap: Map<string, SpecificFieldsDto>): void {
    const fieldListHash = createUniqueHash(fieldList.fields);
    const fieldGroup = fieldGroupsMap.get(fieldListHash) || {
      parameters: {
        countriesAuthorities: [],
        currencies: fieldList.currency ? [fieldList.currency] : [],
      },
      fields: fieldList.fields,
    };

    const countryAuthorityExists = fieldGroup.parameters.countriesAuthorities
      .some(ca => ca.country === fieldList.country && ca.authority === fieldList.authority);

    if (!countryAuthorityExists) {
      fieldGroup.parameters.countriesAuthorities.push({ country: fieldList.country, authority: fieldList.authority });
    }

    if (fieldList.currency && !fieldGroup.parameters.currencies.includes(fieldList.currency)) {
      fieldGroup.parameters.currencies.push(fieldList.currency);
    }

    fieldGroupsMap.set(fieldListHash, fieldGroup);
  }
}
