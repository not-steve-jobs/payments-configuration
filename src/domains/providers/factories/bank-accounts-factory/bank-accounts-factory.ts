import { BankAccountData, BankAccountEntity } from '@core';

type BankAccountEntityParams =  Pick<BankAccountEntity, 'providerCode' | 'authorityFullCode' | 'currencyIso3' | 'countryIso2'>

export class BankAccountsFactory {
  public static createUpdateEntities(providerCode: string, credentialsData: BankAccountData[]): BankAccountEntity[] {
    const entities: BankAccountEntity[] = [];

    for (const { parameters, bankAccounts } of credentialsData) {
      const entityParams: BankAccountEntityParams = {
        providerCode,
        authorityFullCode: parameters.authority,
        currencyIso3: parameters.currency,
        countryIso2: parameters.country || null,
      };

      bankAccounts.forEach(ba => {
        entities.push({
          ...entityParams,
          name: ba.name,
          type: ba.type,
          configs: JSON.stringify(ba.configs),
        });
      });
    }

    return entities;
  }
}
