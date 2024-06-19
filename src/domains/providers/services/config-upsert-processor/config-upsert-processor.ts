import { Knex } from 'knex';

import { ILogger } from '@internal/logger-library';
import { CountryAuthorityMethodDto, CountryAuthorityMethodEntity, ProviderEntity, ProviderMethodEntity } from '@core';
import { CountryAuthorityMethods } from '@domains/providers/types/contracts';
import { CountryAuthorityMethodRepository, ProviderMethodRepository, ProviderRepository } from '@infra';
import { buildKey, groupBy } from '@utils';
import { CountryAuthorityMethodFactory, ProviderFactory, ProviderMethodFactory } from '@domains/providers/factories';

import { ConfigUpsertCleaner } from './config-upsert-cleaner';

export interface ConfigUpsertProcessorV2Options {
  countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  providerMethodRepository: ProviderMethodRepository;
  providerRepository: ProviderRepository;
  configUpsertCleaner: ConfigUpsertCleaner;
  logger: ILogger;
}

export interface ConfigUpsertParams {
  provider: Partial<ProviderEntity>;
  countryAuthorityMethods: CountryAuthorityMethods[];
}

export interface ConfigUpsertResponse {
  provider: ProviderEntity;
  countryAuthorityMethods: CountryAuthorityMethodDto[];
}

export class ConfigUpsertProcessor {
  private readonly countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  private readonly providerRepository: ProviderRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly configUpsertCleaner: ConfigUpsertCleaner;
  private readonly logger: ILogger;

  constructor(options: ConfigUpsertProcessorV2Options) {
    this.providerMethodRepository = options.providerMethodRepository;
    this.countryAuthorityMethodRepository = options.countryAuthorityMethodRepository;
    this.providerRepository = options.providerRepository;
    this.configUpsertCleaner = options.configUpsertCleaner;
    this.logger = options.logger;
  }

  private getCountryAuthorityMethods(countryAuthorityMethods: CountryAuthorityMethods[], tx: Knex.Transaction): Promise<CountryAuthorityMethodEntity[]> {
    const { methodIds, countryAuthorityIds } = countryAuthorityMethods.reduce((acc, next) => {
      acc.methodIds.add(next.method.id);
      acc.countryAuthorityIds.add(next.countryAuthority.id);

      return acc;
    }, { methodIds: new Set<string>(), countryAuthorityIds: new Set<string>() });

    return this.countryAuthorityMethodRepository.findAll({
      params: { countryAuthorityId: Array.from(countryAuthorityIds), methodId: Array.from(methodIds) },
    }, tx);
  }

  private async createOrUpdateProvider(provider: Partial<ProviderEntity>, tx: Knex.Transaction): Promise<ProviderEntity> {
    const providerEntityModel = ProviderFactory.createEntityModel(provider);

    return this.providerRepository.createOrUpdate(providerEntityModel, tx);
  }

  private buildPMethodsToProcess(
    providerId: string,
    providerMethods: ProviderMethodEntity[],
    countryAuthorityMethods: CountryAuthorityMethodEntity[],
    countryAuthorityMethodsToUpdate: CountryAuthorityMethods[]
  ): { pMethodsToCreate: ProviderMethodEntity[]; pMethodsToDetach: ProviderMethodEntity[] } {
    const providerMethodMap = groupBy(providerMethods, pm => buildKey(pm.providerId, pm.countryAuthorityMethodId));
    const pMethodsToCreate: ProviderMethodEntity[] = [];
    const pMethodsBoundedSet = new Set<string>();
    const countryAuthorityToMethodsSet = countryAuthorityMethodsToUpdate.reduce((acc, next) => {
      const methodIds = acc.get(next.countryAuthority.id) ?? new Set<string>();

      methodIds.add(next.method.id);

      acc.set(next.countryAuthority.id, methodIds);
      return acc;
    }, new Map<string, Set<string>>());

    for (const cam of countryAuthorityMethods) {
      if (!countryAuthorityToMethodsSet.get(cam.countryAuthorityId)?.has(cam.methodId)) {
        continue;
      }

      const key = buildKey(providerId, cam.id);
      const [providerMethod] = providerMethodMap.get(key) ?? [];

      if (!providerMethod) {
        const entity = ProviderMethodFactory.createEntityModel({
          countryAuthorityMethodId: cam.id,
          providerId,
          isEnabled: false,
        });

        pMethodsToCreate.push(entity);
        pMethodsBoundedSet.add(entity.id);
      } else {
        pMethodsBoundedSet.add(providerMethod.id);
      }
    }

    return { pMethodsToCreate, pMethodsToDetach: providerMethods.filter(pm => !pMethodsBoundedSet.has(pm.id)) };
  }

  private buildCAMToProcess(entities: CountryAuthorityMethodEntity[], countryAuthorityMethods: CountryAuthorityMethods[]): CountryAuthorityMethodEntity[] {
    const keyToCAMMap = groupBy(entities, ({ countryAuthorityId, methodId }) => buildKey(countryAuthorityId, methodId));
    const countryAuthorityToCreate: CountryAuthorityMethodEntity[] = [];

    for (const cam of countryAuthorityMethods) {
      const key = buildKey(cam.countryAuthority.id, cam.method.id);
      const countryAuthorityMethod = keyToCAMMap.get(key);

      if (!countryAuthorityMethod) {
        countryAuthorityToCreate.push(CountryAuthorityMethodFactory.createEntityModel({
          countryAuthorityId: cam.countryAuthority.id,
          methodId: cam.method.id,
          isEnabled: false,
        }));
      }
    }

    return countryAuthorityToCreate;
  }

  public async upsert(params: ConfigUpsertParams): Promise<ConfigUpsertResponse> {
    const provider = await this.providerMethodRepository.runInTransaction<ProviderEntity>(async tx => {
      const [p, countryAuthorityMethods] = await Promise.all([
        this.createOrUpdateProvider(params.provider, tx),
        this.getCountryAuthorityMethods(params.countryAuthorityMethods, tx),
      ]);
      const providerMethods = await this.providerMethodRepository.findAll({ params: { providerId: p.id } }, tx);

      const camToCreate = this.buildCAMToProcess(countryAuthorityMethods, params.countryAuthorityMethods);
      const { pMethodsToCreate, pMethodsToDetach } = this.buildPMethodsToProcess(
        p.id,
        providerMethods,
        countryAuthorityMethods.concat(camToCreate),
        params.countryAuthorityMethods
      );

      if (camToCreate.length) {
        await this.countryAuthorityMethodRepository.batchInsert(camToCreate, tx);
        this.logger.info(`Created ${camToCreate.length} country authority methods`);
      }

      if (pMethodsToCreate.length) {
        await this.providerMethodRepository.batchInsert(pMethodsToCreate, tx);
        this.logger.info(`Created ${pMethodsToCreate.length} provider methods`);
      }

      if (pMethodsToDetach.length) {
        await this.configUpsertCleaner.clean(p.code, {
          pMethodIdsToDelete: pMethodsToDetach.map(({ id }) => id),
          countryAuthorityMethods: params.countryAuthorityMethods,
        }, tx);
      }

      return p;
    });

    return { provider, countryAuthorityMethods: await this.providerMethodRepository.findRelatedCountryAuthorityMethods(provider.id) };
  }
}
