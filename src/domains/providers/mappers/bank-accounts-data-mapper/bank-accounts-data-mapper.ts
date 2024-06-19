import { BankAccount, BankAccountData, BankAccountDataParameters, BankAccountDto, CredentialDto } from '@core';
import { createUniqueHash } from '@utils';

export class BankAccountsDataMapper {
  private static bankAccountsToParameterMap: Partial<Record<keyof CredentialDto, string>> = {
    authorityFullCode: 'authority',
    currencyIso3: 'currency',
    countryIso2: 'country',
  };

  private static createNewBankAccountsParameters(bankAccount: BankAccountDto): BankAccountDataParameters {
    return  Object.entries(bankAccount).reduce<BankAccountDataParameters>((acc, [key, value]) => {
      const parameter = this.bankAccountsToParameterMap[key as keyof CredentialDto];

      if (parameter && value !== null) {
        acc[parameter] = value;
      }

      return acc;
    }, {} as BankAccountDataParameters);
  }

  public static mapToBankAccountData(bankAccounts: BankAccountDto[]): BankAccountData[] {
    const map = new Map<string, BankAccountData>();

    bankAccounts.forEach(ba => {
      const parameters = this.createNewBankAccountsParameters(ba);
      const key = createUniqueHash(parameters);
      const baData = map.get(key);

      const bankAccount: BankAccount = {
        name: ba.name,
        type: ba.type,
        configs: ba.configs,
      };

      if (baData) {
        baData.bankAccounts.push(bankAccount);
      } else {
        map.set(key, { parameters, bankAccounts: [bankAccount] });
      }
    });

    const baData = [...map.values()];
    baData.forEach(ba => ba.bankAccounts = this.sortBankAccounts(ba.bankAccounts));

    return baData;
  }

  private static sortBankAccounts(bankAccounts: BankAccount[]): BankAccount[] {
    return bankAccounts.sort((b1, b2) => (b1.name > b2.name ? 1 : -1));
  }
}
