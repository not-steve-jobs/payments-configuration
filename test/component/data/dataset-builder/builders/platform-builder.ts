import casual from 'casual';
import { randomUUID } from 'crypto';

import { ApplicationPlatforms, PlatformEntity } from '@core';
import { DbTable } from '@internal/component-test-library';

import { Builder } from './abstract-builder';

export class PlatformBuilder extends Builder<PlatformEntity> {
  public tableName = DbTable.cpPlatforms;

  protected getNewEntity(payload: Partial<PlatformEntity>): PlatformEntity {
    return {
      id: randomUUID(),
      name: payload.name || casual.random_value(ApplicationPlatforms),
      version: payload.version || this.getRandomWord(),
      date: payload.date,
    };
  }
}
