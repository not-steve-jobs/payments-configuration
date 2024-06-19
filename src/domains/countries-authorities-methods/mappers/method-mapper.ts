import { randomUUID } from 'crypto';

import { MethodEntity } from '@core';

import { MethodDto } from '../types';

export class MethodMapper {
  public static createDto(entity: MethodEntity): MethodDto {
    return {
      code: entity.code,
      name: entity.name,
      description: entity.description,
    };
  }

  public static createEntityModel(payload: MethodDto): MethodEntity {
    return {
      id: randomUUID(),
      code: payload.code,
      name: payload.name,
      description: payload.description,
    };
  }
}
