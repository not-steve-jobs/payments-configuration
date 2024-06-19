import { Knex } from 'knex';

import { AuthorityEntity, CpTables } from '@core';
import { NotFoundError } from '@internal/errors-library';

import { AbstractRepository } from './abstract-repository';
export class AuthorityRepository extends AbstractRepository<AuthorityEntity> {
  protected readonly entity = CpTables.CP_AUTHORITIES;

  public async findOneOrThrow(fullCode: string, transaction?: Knex.Transaction): Promise<AuthorityEntity> {
    const authority = await this.findOne({ fullCode }, transaction);

    if (!authority) {
      throw new NotFoundError('Authority not found', { id: fullCode });
    }

    return authority;
  }
}
