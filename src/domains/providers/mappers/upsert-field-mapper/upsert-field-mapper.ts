import { randomUUID } from 'crypto';

import { FieldEntityType, UnboundedFieldEntity } from '@core';
import { FieldWithOptionsDto, FieldsWithOptions, UnboundedFieldsWithOptions } from '@domains/providers/types';
import { FieldOptionMapper } from '@domains/providers/mappers/field-option-mapper';
import { FieldMapper } from '@domains/providers/mappers/field-mapper';

interface UpsertFieldsWithOptionsParams {
  entityType: FieldEntityType;
  entityId: string;
  currency?: string | null;
}

export class UpsertFieldMapper {
  public static createCommon(providerId: string, payload: FieldWithOptionsDto[]): FieldsWithOptions {
    return this.create(payload, {
      entityId: providerId,
      entityType: FieldEntityType.PROVIDER,
    });
  }

  public static createSpecific(providerMethodId: string, currency: string | null, payload: FieldWithOptionsDto[]): FieldsWithOptions {
    return this.create(payload, {
      entityId: providerMethodId,
      entityType: FieldEntityType.PROVIDER_METHOD,
      currency,
    });
  }

  public static createUnbounded = (payload: FieldWithOptionsDto[], currency: string | null): UnboundedFieldsWithOptions =>
    payload.reduce((acc, next) => {
      const field = this.createUnboundedEntity(next, currency || null);

      const options = next.options.map(p =>
        FieldOptionMapper.createEntityModel(field.id, p));

      acc.fields.push(field);
      acc.options.push(...options);

      return acc;
    }, { fields: [], options: [] } as UnboundedFieldsWithOptions);

  public static createUnboundedEntity(payload: FieldWithOptionsDto, currencyIso3: string | null): UnboundedFieldEntity {
    return {
      id: randomUUID(),
      key: payload.key,
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

  private static create = (payload: FieldWithOptionsDto[], params: UpsertFieldsWithOptionsParams): FieldsWithOptions =>
    payload.reduce((acc, next) => {
      const field = FieldMapper.createEntityModel(
        next,
        params.entityId,
        params.entityType,
        params.currency || null
      );

      const options = next.options.map(p =>
        FieldOptionMapper.createEntityModel(field.id, p));

      acc.fields.push(field);
      acc.options.push(...options);

      return acc;
    }, { fields: [], options: [] } as FieldsWithOptions);
}
