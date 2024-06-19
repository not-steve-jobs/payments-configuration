import { Knex } from 'knex';

import {
  BankAccountsRepository,
  CredentialsRepository,
  FieldRepository, ProviderFieldRepository,
  ProviderMethodRepository,
  ProviderRestrictionsRepository,
  StpProviderRuleRepository, TransactionConfigRepository,
} from '@infra/repos';
import { CountryAuthorityMethods } from '@domains/providers/types';
import { CountryAuthorityEntity } from '@core';
import { buildKey } from '@utils';

export interface ConfigUpsertCleanerOptions {
  transactionConfigRepository: TransactionConfigRepository;
  providerRestrictionsRepository: ProviderRestrictionsRepository;
  stpProviderRuleRepository: StpProviderRuleRepository;
  providerMethodRepository: ProviderMethodRepository;
  credentialsRepository: CredentialsRepository;
  bankAccountsRepository: BankAccountsRepository;
  fieldRepository: FieldRepository;
  providerFieldRepository: ProviderFieldRepository;
}

interface CleanParams {
  pMethodIdsToDelete: string[];
  countryAuthorityMethods: CountryAuthorityMethods[];
}

export class ConfigUpsertCleaner {
  private readonly transactionConfigRepository: TransactionConfigRepository;
  private readonly providerRestrictionsRepository: ProviderRestrictionsRepository;
  private readonly stpProviderRuleRepository: StpProviderRuleRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly credentialsRepository: CredentialsRepository;
  private readonly bankAccountsRepository: BankAccountsRepository;
  private readonly fieldRepository: FieldRepository;
  private readonly providerFieldRepository: ProviderFieldRepository;

  constructor(options: ConfigUpsertCleanerOptions) {
    this.transactionConfigRepository = options.transactionConfigRepository;
    this.providerRestrictionsRepository = options.providerRestrictionsRepository;
    this.providerMethodRepository = options.providerMethodRepository;
    this.credentialsRepository = options.credentialsRepository;
    this.providerRestrictionsRepository = options.providerRestrictionsRepository;
    this.fieldRepository = options.fieldRepository;
    this.bankAccountsRepository = options.bankAccountsRepository;
    this.stpProviderRuleRepository = options.stpProviderRuleRepository;
    this.providerFieldRepository = options.providerFieldRepository;
  }

  public async clean(providerCode: string, params: CleanParams, tx: Knex.Transaction): Promise<void | never> {
    const countryAuthorities = this.getCountryAuthorities(params.countryAuthorityMethods);

    await this.transactionConfigRepository.removeAll({ providerMethodIds: params.pMethodIdsToDelete }, tx);
    await this.providerMethodRepository.remove(params.pMethodIdsToDelete, tx);
    await this.fieldRepository.removeProviderMethodFields(params.pMethodIdsToDelete, tx);

    await Promise.all([
      this.credentialsRepository.deleteNotInCA(providerCode, countryAuthorities, tx),
      this.bankAccountsRepository.deleteNotInCA(providerCode, countryAuthorities, tx),
      this.stpProviderRuleRepository.deleteNotInCA(providerCode, countryAuthorities, tx),
      this.providerRestrictionsRepository.deleteNotInCA(providerCode, countryAuthorities, tx),
      this.providerFieldRepository.deleteNotInCA(providerCode, countryAuthorities, tx),
    ]);
  }

  private getCountryAuthorities(
    countryAuthorityMethods: CountryAuthorityMethods[]
  ): Pick<CountryAuthorityEntity, 'id' | 'authorityFullCode' | 'countryIso2'>[] {
    return Array.from(countryAuthorityMethods.reduce((acc, next) => {
      const { countryAuthority: { id, authorityFullCode, countryIso2 } } = next;

      acc.set(buildKey(authorityFullCode, countryIso2), { id, authorityFullCode, countryIso2 });

      return acc;
    }, new Map<string, Pick<CountryAuthorityEntity, 'id' | 'authorityFullCode' | 'countryIso2'>>()).values());
  }
}
