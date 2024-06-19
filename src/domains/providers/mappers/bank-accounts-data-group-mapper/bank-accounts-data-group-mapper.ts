import {
  BankAccount,
  BankAccountData, BankAccountDataParameters,
  BankAccountsGroupedData, BankAccountsGroupedDataParams,
} from '@core/contracts';
import { createUniqueHash } from '@utils';

interface ConfigGroup {
  bankAccounts: BankAccount[];
  parameters: BankAccountDataParameters[];
}

interface CurrenciesGroup {
  authority: string;
  country: string | null;
  currencies: string[];
}

export class BankAccountsDataGroupMapper {

  public static dataListToGroup(bankAccountsDataList: BankAccountData[]): BankAccountsGroupedData[] {
    const configGroups = this.groupByConfigs(bankAccountsDataList);
    return this.groupByParams(configGroups);
  }

  public static groupToDataList(groupedData: BankAccountsGroupedData[]): BankAccountData[] {
    return groupedData.flatMap(gr => gr.parameters.currencies.flatMap(currency => gr.parameters.countryAuthorities.map(ca => ({
      parameters: {
        authority: ca.authority!,
        country: ca.country,
        currency,
      },
      bankAccounts: gr.bankAccounts,
    }))));
  }

  private static groupByConfigs(bankAccountsDataList: BankAccountData[]): ConfigGroup[] {
    const map = new Map<string, ConfigGroup>();
    for (const bankAccountData of bankAccountsDataList) {
      const key = createUniqueHash(bankAccountData.bankAccounts);
      const group = map.get(key);
      if (group) {
        group.parameters.push(bankAccountData.parameters);
      } else {
        map.set(key, { bankAccounts: bankAccountData.bankAccounts, parameters: [bankAccountData.parameters] });
      }
    }
    return [...map.values()];
  }

  private static groupByParams(configsGroup: ConfigGroup[]): BankAccountsGroupedData[] {
    const groups: BankAccountsGroupedData[] = [];

    configsGroup.forEach(cg => {
      const currenciesGroups = this.groupByCurrencies(cg);
      const groupedParameters = this.groupByCA(currenciesGroups);

      for (const parameters of groupedParameters) {
        groups.push({
          parameters,
          bankAccounts: cg.bankAccounts,
        });
      }
    });

    return groups;
  }

  private static groupByCurrencies(configGroup: ConfigGroup): CurrenciesGroup[] {
    const caToCurrenciesMap = new Map<string, CurrenciesGroup>();

    configGroup.parameters.forEach(params => {
      const key = `${params.authority}:${params.country}`;
      const ca = caToCurrenciesMap.get(key);
      if (ca) {
        ca.currencies.push(params.currency);
      } else {
        caToCurrenciesMap.set(key, { authority: params.authority, country: params.country, currencies: [params.currency] });
      }
    });

    return [...caToCurrenciesMap.values()];
  }

  private static groupByCA(currenciesGroups: CurrenciesGroup[]): BankAccountsGroupedDataParams[] {
    const groupedParamsMap = new Map<string, BankAccountsGroupedDataParams>();

    for (const currenciesGroup of currenciesGroups) {
      const key = createUniqueHash(currenciesGroup.currencies);
      const groupedParams = groupedParamsMap.get(key);
      const countryAuthority = { authority: currenciesGroup.authority, country: currenciesGroup.country || null };

      if (groupedParams) {
        groupedParams.countryAuthorities.push(countryAuthority);
      } else {
        groupedParamsMap.set(key, { countryAuthorities: [countryAuthority], currencies: currenciesGroup.currencies });
      }
    }

    return [...groupedParamsMap.values()];
  }
}
