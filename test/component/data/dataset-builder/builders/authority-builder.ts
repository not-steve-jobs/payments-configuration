import { DbTable } from '@internal/component-test-library';
import { AuthorityEntity } from '@core';

import { Builder } from './abstract-builder';

export class AuthorityBuilder extends Builder<AuthorityEntity> {
  public tableName = DbTable.cpAuthorities;

  protected getNewEntity(payload: Partial<AuthorityEntity>): AuthorityEntity {
    return {
      fullCode: payload.fullCode || this.getRandomWord(),
      name: payload.name || this.getRandomWord(),
    };
  }
}
