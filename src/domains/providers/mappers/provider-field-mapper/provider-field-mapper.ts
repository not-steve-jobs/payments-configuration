import { Field, FieldOptionDto, Option, ProviderFieldsEntity, TransactionType } from '@core';
import { FieldWithOptionsDto, ProviderFields } from '@domains/providers';
import { CommonFieldMapper, SpecificFieldMapper } from '@domains/providers/mappers';
import { BadRequestError } from '@internal/errors-library';

export class ProviderFieldMapper {
  public static createFieldDto = (field: Field, transactionType: TransactionType): FieldWithOptionsDto => ({
    key: field.key,
    transactionType,
    fieldType: field.valueType,
    name: 'name' in field ? field.name : undefined,
    defaultValue: 'defaultValue' in field ? field.defaultValue : undefined,
    pattern: field.pattern,
    isMandatory: field.isMandatory,
    isEnabled: field.isEnabled,
    options: field.options,
  });

  public static mapFieldsToDtos(fields: ProviderFieldsEntity[]): ProviderFields {
    const { commonEntities, specificEntities } = this.getCommonAndSpecificEntities(fields);

    const common = CommonFieldMapper.createDtos(commonEntities);
    const specific = SpecificFieldMapper.createDtos(specificEntities);

    return { common, specific };
  }

  public static createFieldsByTransactionType(fields: FieldWithOptionsDto[]): Map<TransactionType, Field[]> {
    return fields.reduce((map, f) => {
      const list: Field[] = map.get(f.transactionType) || [];
      list.push(ProviderFieldMapper.createField(f));

      return map.set(f.transactionType, list);
    }, new Map<TransactionType, Field[]>);
  }

  public static createEntity(payload: {
    providerCode: string;
    countryIso2: string | null;
    authorityFullCode: string | null;
    currencyIso3: string | null;
    transactionType: TransactionType;
    fields: Field[];
  }): ProviderFieldsEntity {
    return {
      providerCode: payload.providerCode,
      countryIso2: payload.countryIso2,
      authorityFullCode: payload.authorityFullCode,
      currencyIso3: payload.currencyIso3,
      transactionType: payload.transactionType,
      fields: JSON.stringify(payload.fields),
    };
  }

  public static createField(dto: FieldWithOptionsDto): Field {
    switch (dto.transactionType) {
      case TransactionType.DEPOSIT:
        return {
          key: dto.key,
          valueType: dto.fieldType,
          defaultValue: dto.defaultValue ?? '',
          pattern: dto.pattern,
          isMandatory: dto.isMandatory,
          isEnabled: dto.isEnabled,
          options: this.createOptions(dto.options),
        };
      case TransactionType.PAYOUT:
      case TransactionType.REFUND:
        return {
          key: dto.key,
          name: dto.name ?? '',
          valueType: dto.fieldType,
          pattern: dto.pattern,
          isMandatory: dto.isMandatory,
          isEnabled: dto.isEnabled,
          options: this.createOptions(dto.options),
        };
      default:
        throw new BadRequestError(`Unknown transactionType: ${dto.transactionType}`);
    }
  }

  public static createEntities(providerCode: string, payload: ProviderFields): ProviderFieldsEntity[] {
    const commonProviderFields = CommonFieldMapper.createEntities(providerCode, payload.common);
    const specificProviderFields = SpecificFieldMapper.createEntities(providerCode, payload.specific);

    return [...commonProviderFields, ...specificProviderFields];
  }

  private static getCommonAndSpecificEntities(fields: ProviderFieldsEntity[]): {
    commonEntities: ProviderFieldsEntity[];
    specificEntities: ProviderFieldsEntity[];
  } {
    const commonEntities: ProviderFieldsEntity[] = [];
    const specificEntities: ProviderFieldsEntity[] = [];

    for (const f of fields) {
      if (f.countryIso2 || f.authorityFullCode || f.currencyIso3) {
        specificEntities.push(f);
      } else {
        commonEntities.push(f);
      }
    }

    return { commonEntities, specificEntities };
  }

  private static createOptions(dtos: Option[]): FieldOptionDto[] {
    return dtos.map(d => ({
      key: d.key,
      value: d.value,
      isEnabled: d.isEnabled,
    }));
  }
}
