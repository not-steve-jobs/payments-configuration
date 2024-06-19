import { Knex } from 'knex';

import { SelectByEntityParams } from '@infra/repos/abstract-repository';
import { BankAccountEntity, CpTables } from '@core';
import { BankAccountDto } from '@core/contracts/dtos/bank-account-dto';

import { CountryAuthorityBindableRepository } from './country-authority-bindable-repository';

export class BankAccountsRepository extends CountryAuthorityBindableRepository<BankAccountEntity> {
  protected readonly entity = CpTables.CP_BANK_ACCOUNTS;

  public async findAllBankAccounts(params: SelectByEntityParams<BankAccountEntity> = {}, tx?: Knex.Transaction): Promise<BankAccountDto[]> {
    const bankAccounts = await this.findAll({
      params,
      order: ['authorityFullCode', 'countryIso2', 'currencyIso3'],
    }, tx);

    return bankAccounts.map<BankAccountDto>(ba => ({
      ...ba,
      configs: JSON.parse(ba.configs),
    }));
  }

  public async replaceBankAccounts(providerCode: string, bankAccounts: BankAccountEntity[]): Promise<BankAccountDto[]> {
    await this.runInTransaction(async tx => {
      const deleteQuery = this.queryBuilder.where({ providerCode }).del().transacting(tx);
      await this.executeQuery<void>(deleteQuery);

      if (bankAccounts.length) {
        const insertQuery = this.queryBuilder.insert(bankAccounts).transacting(tx);
        await this.executeQuery<void>(insertQuery);
      }
    });

    return await this.findAllBankAccounts({ providerCode });
  }

  public async findAllByAuthorityAndCountry(
    providerCodes: string[],
    authorityFullCode: string,
    countryIso2: string
  ): Promise<BankAccountEntity[]> {
    return this.queryBuilder
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
  }
}
