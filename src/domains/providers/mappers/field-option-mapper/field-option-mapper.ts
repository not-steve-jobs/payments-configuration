import { randomUUID } from 'crypto';

import { FieldOptionDto, FieldOptionEntity } from '@core';
import { FieldOptionUpdateDto } from '@domains/providers/types/contracts';

export class FieldOptionMapper {
  public static createEntityModel(fieldId: string, payload: FieldOptionUpdateDto): FieldOptionEntity {
    return {
      id: randomUUID(),
      fieldId,
      key: payload.key,
      value: payload.value,
      isEnabled: payload.isEnabled,
    };
  }

  public static createDto(option: FieldOptionEntity): FieldOptionDto {
    return {
      key: option.key,
      value: option.value,
      isEnabled: option.isEnabled,
    };
  }
}
