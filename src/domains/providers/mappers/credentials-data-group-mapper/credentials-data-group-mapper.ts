import { CredentialDetails, CredentialsData, CredentialsGroupedData } from '@domains/providers/types';

interface GroupItem {
  currencies: string[];
  countryAuthority?: {
    authority?: string;
    country?: string;
  };
}

interface Group {
  credentialsDetails: CredentialDetails[];
  items: GroupItem[];
}

type CountryAuthorityGroup = { credentialsDetails: CredentialDetails[]; countryAuthorityGroup: Map<string, GroupItem> }

export class CredentialsDataGroupMapper {
  private static createKey<T>(object: T, prefix?: string | null): string {
    const key = JSON.stringify(object);

    return prefix ? `${prefix}:${key}` : key;
  }

  private static isEmptyObject(object: Record<string, unknown> = {}): boolean {
    return (object && Object.keys(object).length === 0) || false;
  }

  private static groupIncludesCurrencies(currenciesGroup: string[] = [], currenciesGroupItem: string[] = []): boolean {
    if (currenciesGroup.length !== currenciesGroupItem.length) {
      return false;
    }

    return currenciesGroupItem.every(c => currenciesGroup.includes(c));
  }

  private static createCredentialsData(group: Group, groupItem: GroupItem): CredentialsGroupedData {
    const credentialsData: CredentialsGroupedData = { parameters: {}, credentialsDetails: group.credentialsDetails };

    if (!(this.isEmptyObject(groupItem.countryAuthority) && groupItem.currencies.length === 0)) {
      credentialsData.parameters.countryAuthorities = [groupItem.countryAuthority!];
      credentialsData.parameters.currencies = groupItem.currencies;
    }

    return credentialsData;
  }

  private static buildGroups(credentialsData: CredentialsData[]): Group[] {
    const groupToCountryAuthorityGroup = new Map<string, CountryAuthorityGroup>();

    for (const { credentialsDetails, parameters } of credentialsData) {
      const { currency, ...countryAuthority } = parameters;
      const groupKey = this.createKey(credentialsDetails);
      const countryAuthorityKey = this.createKey(countryAuthority, currency ? null : 'all');

      const group = groupToCountryAuthorityGroup.get(groupKey) ?? { credentialsDetails, countryAuthorityGroup: new Map<string, GroupItem>() };
      const item = group.countryAuthorityGroup.get(countryAuthorityKey) ?? { countryAuthority, currencies: [] };

      if (currency) {
        item.currencies.push(currency);
      }

      group.countryAuthorityGroup.set(countryAuthorityKey, item);
      groupToCountryAuthorityGroup.set(groupKey, group);
    }

    return Array.from(groupToCountryAuthorityGroup.values()).flatMap(m => ({
      credentialsDetails: m.credentialsDetails,
      items: [...m.countryAuthorityGroup.values()],
    }));
  }

  private static createCredentialsGroupedDataList(group: Group): CredentialsGroupedData[] {
    const credentialsGroupedDataList: CredentialsGroupedData[] = [];
    const countryAuthorityGroupSet = new Set<string>();

    for (const item of group.items) {
      let credentialsGroupedData = credentialsGroupedDataList.find(cd =>
        this.groupIncludesCurrencies(cd.parameters.currencies, item.currencies) && !this.isEmptyObject(cd.parameters));
      const countryAuthorityGroupKey = `${item.countryAuthority?.country}:${item.countryAuthority?.authority}`;

      if (!credentialsGroupedData) {
        credentialsGroupedData = this.createCredentialsData(group, item);
        credentialsGroupedDataList.push(credentialsGroupedData);
        countryAuthorityGroupSet.add(countryAuthorityGroupKey);
      }

      if (
        !this.isEmptyObject(item.countryAuthority)
        && !countryAuthorityGroupSet.has(countryAuthorityGroupKey)
      ) {
        credentialsGroupedData.parameters.countryAuthorities!.push(item.countryAuthority!);
        countryAuthorityGroupSet.add(countryAuthorityGroupKey);
      }
    }

    return credentialsGroupedDataList;
  }

  public static groupToCredentialDataList(credentialsGroupedData: CredentialsGroupedData[]): CredentialsData[] {
    return credentialsGroupedData.flatMap(cgd => {
      // Shared credentials
      if (!cgd.parameters.countryAuthorities && !cgd.parameters.currencies) {
        return [{ parameters: {}, credentialsDetails: cgd.credentialsDetails }];
      }

      return cgd.parameters.countryAuthorities?.flatMap(countryAuthority => {
        if (cgd.parameters.currencies?.length) {
          return cgd.parameters.currencies.map(currency => ({
            parameters: { ...countryAuthority, currency },
            credentialsDetails: cgd.credentialsDetails,
          }));
        } else {
          return [{ parameters: { ...countryAuthority }, credentialsDetails: cgd.credentialsDetails }];
        }
      }) || [];
    });
  }

  public static credentialDataListToGroup(credentialsDataList: CredentialsData[]): CredentialsGroupedData[] {
    const groups = this.buildGroups(credentialsDataList);
    const credentialsData: CredentialsGroupedData[] = [];

    for (const group of groups) {
      this.createCredentialsGroupedDataList(group).forEach(g => {
        credentialsData.push(g);
      });
    }

    return credentialsData;
  }
}
