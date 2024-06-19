import { DbTable, dbDelete } from '@internal/component-test-library';

export async function cleanUp(tables?: DbTable[]): Promise<void> {
  const fkTableOrders = [
    DbTable.cpProviderFields,
    DbTable.cpBankAccounts,
    DbTable.cpProviderFields,
    DbTable.cpProviderRestrictions,
    DbTable.cpStpProviderRules,
    DbTable.cpStpRules,
    DbTable.cpCredentials,
    DbTable.cpBankAccounts,
    DbTable.cpFieldOptions,
    DbTable.cpFields,
    DbTable.cpTransactionConfigs,
    DbTable.cpProviderMethods,
    DbTable.cpProviders,
    DbTable.cpCountryAuthorityMethods,
    DbTable.cpCountriesAuthorities,
    DbTable.cpCountries,
    DbTable.cpAuthorities,
    DbTable.cpMethods,
    DbTable.cpCurrencies,
    DbTable.cpPlatforms,
  ];

  for (const tableName of (tables ?? fkTableOrders)) {
    await dbDelete(tableName, {});
  }
}
