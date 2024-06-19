import { Knex } from 'knex';

import { CpTables, CredentialDto, CredentialEntity } from '@core';

import { SelectByEntityParams } from './abstract-repository';
import { CountryAuthorityBindableRepository } from './country-authority-bindable-repository';

export class CredentialsRepository extends CountryAuthorityBindableRepository<CredentialEntity> {
  protected readonly entity = CpTables.CP_CREDENTIALS;

  public async findAllByAuthorityAndCountry(
    providerCodes: string[],
    authorityFullCode: string,
    countryIso2: string
  ): Promise<CredentialDto[]> {
    const credentials: CredentialEntity[] = await this.queryBuilder
      .whereIn(`${this.entity}.providerCode`, providerCodes)
      .andWhere(queryBuilder => {
        queryBuilder
          .where(qb => qb // Filled countryIso2 AND filled authorityFullCode
            .where('countryIso2', countryIso2)
            .andWhere('authorityFullCode', authorityFullCode)
          )
          .orWhere(qb => qb // Filled countryIso2 AND empty authorityFullCode
            .where('countryIso2', countryIso2)
            .andWhere('authorityFullCode', null)
          )
          .orWhere(qb => qb // Empty countryIso2 AND filled authorityFullCode
            .where('countryIso2', null)
            .andWhere('authorityFullCode', authorityFullCode)
          )
          .orWhere(qb => qb // Empty countryIso2 AND empty authorityFullCode
            .where('countryIso2', null)
            .andWhere('authorityFullCode', null)
          );
      })
      .orderBy(['authorityFullCode', 'countryIso2', 'currencyIso3']);


    return credentials.map<CredentialDto>(c => ({
      ...c,
      credentialsDetails: JSON.parse(c.credentialsDetails),
    }));
  }

  public async findAllCredentials(params: SelectByEntityParams<CredentialEntity> = {}, tx?: Knex.Transaction): Promise<CredentialDto[]> {
    const credentials = await this.findAll({
      params,
      order: ['authorityFullCode', 'countryIso2', 'currencyIso3'],
    }, tx);

    return credentials.map<CredentialDto>(c => ({
      ...c,
      credentialsDetails: JSON.parse(c.credentialsDetails),
    }));
  }

  public async updateCredentials(providerCode: string, entities: Partial<CredentialEntity>[]): Promise<CredentialDto[]> {
    await this.runInTransaction(async tx => {
      await tx.raw(`SET @@session.unique_checks = 0;`);
      await tx.raw('SET @@session.foreign_key_checks = 0;');

      const deleteQuery = this.queryBuilder.where({ providerCode }).del().transacting(tx);
      await this.executeQuery<void>(deleteQuery);

      if (entities.length) {
        const insertQuery = this.queryBuilder.insert(entities).transacting(tx);
        await this.executeQuery<void>(insertQuery);
      }
    });

    return await this.findAllCredentials({ providerCode });
  }
}
