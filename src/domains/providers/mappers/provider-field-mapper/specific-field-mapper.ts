import { Field, ProviderFieldsEntity } from '@core';
import { FieldWithOptionsDto, SpecificFieldsDto, SpecificFieldsParameters } from '@domains/providers';

import { ProviderFieldMapper } from './provider-field-mapper';

interface ProviderFieldParams {
  providerCode: string;
  country: string;
  authority: string;
  currency: string | null;
}

export class SpecificFieldMapper {
  public static createDtos(entities: ProviderFieldsEntity[]): SpecificFieldsDto[] {
    const fieldsByGroups = this.mergeGroups(entities);
    const result: SpecificFieldsDto[] = [];

    for (const [fields, parameters] of fieldsByGroups) {
      result.push({
        parameters,
        fields: JSON.parse(fields),
      });
    }

    return result;
  }

  public static createEntities(providerCode: string, dtos: SpecificFieldsDto[]): ProviderFieldsEntity[] {
    const result: ProviderFieldsEntity[] = [];

    const fieldsWithRelations = this.getFieldsWithParams(providerCode, dtos);

    for (const { params, fields } of fieldsWithRelations) {
      const fieldsMap = ProviderFieldMapper.createFieldsByTransactionType(fields);

      for (const [transactionType, fieldList] of fieldsMap) {
        result.push(ProviderFieldMapper.createEntity({
          providerCode: params.providerCode,
          countryIso2: params.country,
          authorityFullCode: params.authority,
          currencyIso3: params.currency,
          transactionType,
          fields: fieldList,
        }));
      }
    }

    return result;
  }

  private static getFieldsWithParams(providerCode: string, dtos: SpecificFieldsDto[]): Array<{
    params: ProviderFieldParams;
    fields: FieldWithOptionsDto[];
  }> {
    const result: Array<{ params: ProviderFieldParams; fields: FieldWithOptionsDto[] }> = [];

    for (const { parameters, fields } of dtos) {
      const currencies = parameters.currencies.length ? parameters.currencies : [null];

      for (const { country, authority } of parameters.countriesAuthorities) {
        for (const currency of currencies) {
          result.push({
            params: { providerCode, country, authority, currency },
            fields,
          });
        }
      }
    }

    return result;
  }

  private static mergeGroups(entities: ProviderFieldsEntity[]): Map<string, SpecificFieldsParameters> {
    // Merge fields with different transactionType but with the same relations
    const fieldsByRelations = new Map<string, FieldWithOptionsDto[]>();
    for (const e of entities) {
      const key = `${e.countryIso2}:${e.authorityFullCode}:${e.currencyIso3}`;
      const list = fieldsByRelations.get(key) || [];
      const fields = (JSON.parse(e.fields) as Field[])
        .map(f => ProviderFieldMapper.createFieldDto(f, e.transactionType));

      list.push(...fields);

      fieldsByRelations.set(key, list);
    }

    // Merge parameters with the same fields array
    const fieldsByGroups = new Map<string, SpecificFieldsParameters>;
    for (const [key, fields] of fieldsByRelations) {
      const [country, authority, currency] = key.split(':');
      const fieldsKey = JSON.stringify(fields);
      const params = fieldsByGroups.get(fieldsKey) || {
        countriesAuthorities: [],
        currencies: [],
      };

      const isCaExists = params.countriesAuthorities.find(ca => ca.country === country && ca.authority === authority);
      if (!isCaExists) {
        params.countriesAuthorities.push({ authority, country });
      }

      if (currency !== 'null' && !params.currencies.includes(currency)) {
        params.currencies.push(currency);
      }

      fieldsByGroups.set(fieldsKey, params);
    }

    return fieldsByGroups;
  }
}
