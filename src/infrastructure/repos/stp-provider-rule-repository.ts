import { CpTables, StpProviderRuleEntity } from '@core';

import { CountryAuthorityBindableRepository } from './country-authority-bindable-repository';

export class StpProviderRuleRepository extends CountryAuthorityBindableRepository<StpProviderRuleEntity> {
  protected readonly entity = CpTables.CP_STP_PROVIDER_RULES;

  public async findOneByProviderAndAuthority(providerCode: string, authority: string): Promise<StpProviderRuleEntity | null> {
    const query = this.queryBuilder
      .select(
        `${this.entity}.providerCode`,
        `${this.entity}.authorityFullCode`,
        `${this.entity}.countryIso2`,
        `${this.entity}.data`,
        `${this.entity}.isEnabled`
      )
      .where('providerCode', providerCode)
      .andWhere('authorityFullCode', authority)
      .andWhere('isEnabled', true)
      .first();

    const entity = await this.executeQuery<StpProviderRuleEntity>(query);

    return entity ?? null;
  }

  public async updateStpRules(providerCode: string, entities: Partial<StpProviderRuleEntity>[]): Promise<StpProviderRuleEntity[]> {
    await this.runInTransaction(async tx => {
      const deleteQuery = this.queryBuilder.where({ providerCode }).del().transacting(tx);
      await this.executeQuery<void>(deleteQuery);

      if (entities.length) {
        const insertQuery = this.queryBuilder.insert(entities).transacting(tx);
        await this.executeQuery<void>(insertQuery);
      }
    });

    return await this.findAll({ params: { providerCode } });
  }
}
