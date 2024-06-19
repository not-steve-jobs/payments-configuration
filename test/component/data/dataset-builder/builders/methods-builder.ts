import { randomUUID } from 'crypto';

import { DbTable } from '@internal/component-test-library';
import { MethodEntity } from '@core';

import { Builder } from './abstract-builder';

export class MethodsBuilder extends Builder<MethodEntity> {
  public tableName = DbTable.cpMethods;

  protected getNewEntity(payload: Partial<MethodEntity>): MethodEntity {
    return {
      id: randomUUID(),
      name: payload.name || this.getRandomWord(32),
      code: payload.code || this.getRandomWord(32),
      description: payload.description || this.getRandomWord(32),
    };
  }
}
