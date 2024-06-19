import { CpTables, MethodEntity } from '@core';
import { NotFoundError } from '@internal/errors-library';

import { AbstractRepository } from './abstract-repository';

export class MethodRepository extends AbstractRepository<MethodEntity> {
  protected readonly entity = CpTables.CP_METHODS;

  public async findByCodesOrThrow(codes: string[]): Promise<MethodEntity[]> {
    const query = this.queryBuilder.select(
      `${this.entity}.id`,
      `${this.entity}.code`,
      `${this.entity}.name`
    ).whereIn(`${this.entity}.code`, codes);

    const entities = await this.executeQuery<MethodEntity[]>(query);

    if (entities.length !== codes.length) {
      const notFoundedCode = codes.find(code => !entities.find(e => e.code === code));
      throw new NotFoundError(`Unknown method "${notFoundedCode}"`, { id: notFoundedCode });
    }

    return entities;
  }
}
