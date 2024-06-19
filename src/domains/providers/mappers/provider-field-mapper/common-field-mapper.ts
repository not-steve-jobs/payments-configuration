import { Field, ProviderFieldsEntity } from '@core';
import { FieldWithOptionsDto } from '@domains/providers';

import { ProviderFieldMapper } from './provider-field-mapper';

export class CommonFieldMapper {
  public static createDtos(entities: ProviderFieldsEntity[]): FieldWithOptionsDto[] {
    const result: FieldWithOptionsDto[] = [];

    for (const { fields, transactionType } of entities) {
      const fieldEntities: Field[] = JSON.parse(fields);

      fieldEntities.forEach(f => {
        const fieldDto = ProviderFieldMapper.createFieldDto(f, transactionType);

        result.push(fieldDto);
      });
    }

    return result;
  }

  public static createEntities(providerCode: string, dtos: FieldWithOptionsDto[]): ProviderFieldsEntity[] {
    const result: ProviderFieldsEntity[] = [];

    const fieldsMap = ProviderFieldMapper.createFieldsByTransactionType(dtos);

    for (const [transactionType, fields] of fieldsMap) {
      if (fields.length) {
        result.push(ProviderFieldMapper.createEntity({
          providerCode,
          countryIso2: null,
          authorityFullCode: null,
          currencyIso3: null,
          transactionType,
          fields,
        }));
      }
    }

    return result;
  }
}
