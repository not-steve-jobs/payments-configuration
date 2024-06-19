import { randomUUID } from 'crypto';

import { ProviderDto, ProviderEntity } from '@core';

export class ProviderFactory {
  public static createDto(entity: ProviderEntity): ProviderDto {
    return {
      name: entity.name,
      code: entity.code,
      type: entity.type,
      isEnabled: entity.isEnabled ?? false,
    };
  }

  public static createEntityModel(payload: Partial<ProviderEntity>): ProviderEntity {
    return {
      id: randomUUID(),
      name: payload.name!,
      code: payload.code!,
      type: payload.type!,
      description: payload.description ?? null,
      convertedCurrency: null,
      isEnabled: payload.isEnabled ?? false,
    };
  }
}
