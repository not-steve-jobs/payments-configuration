import { AbstractRepository } from '@infra/repos/abstract-repository';
import { CpTables } from '@core';
import { PlatformEntity } from '@core/contracts/infrastructure/entities/platform-entity';

export class PlatformsRepository extends AbstractRepository<PlatformEntity> {
  protected readonly entity = CpTables.CP_PLATFORMS;

  public async upsert(platforms: PlatformEntity[]): Promise<void> {
    await this.queryBuilder.insert(platforms).onConflict(['name', 'versions']).ignore();
  }

  public async findAll(): Promise<PlatformEntity[]> {
    return this.queryBuilder.select().orderBy('version');
  }
}
