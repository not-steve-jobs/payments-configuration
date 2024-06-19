import path from 'path';
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { createList } from '../sql-utils/seedUtils';
import { isDevPlantLocalEnvironment, isQaPlantOrMockEnvironment } from '../sql-utils/environmentUtils';
import {
  cp_Authorities,
  cp_Countries,
  cp_CountriesAuthorities,
  cp_CountryAuthorityMethods,
  cp_Currencies,
  cp_Fields,
  cp_Methods,
  cp_ProviderMethods,
  cp_Providers,
  cp_TransactionConfigs,
} from '../entity';
import { cp_ProviderFields } from '../entity/cp_ProviderFields';

import {
  authorities,
  countries,
  countriesAuthorities,
  countryAuthorityMethods,
  currencies,
  fields,
  methods,
  providerMethods,
  providers,
  transactionConfigs,
} from './data/1-PaymentsConfiguratorManagementServiceForDevLocalSeeder';
import { providerFields } from './data/1-PaymentsConfiguratorManagementServiceForDevLocalSeeder/providerFields';

export default class ConfiguratorSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    if (!isDevPlantLocalEnvironment() && !isQaPlantOrMockEnvironment()) {
      console.log(`Skipping seeds from ${path.basename(__filename)}`);
      return;
    }

    console.log(`Adding seeds from ${path.basename(__filename)}`);

    await createList(dataSource.manager, cp_Authorities, authorities);
    await createList(dataSource.manager, cp_Countries, countries);
    await createList(dataSource.manager, cp_CountriesAuthorities, countriesAuthorities);
    await createList(dataSource.manager, cp_Methods, methods);
    await createList(dataSource.manager, cp_Currencies, currencies);
    await createList(dataSource.manager, cp_CountryAuthorityMethods, countryAuthorityMethods);
    await createList(dataSource.manager, cp_Providers, providers);
    await createList(dataSource.manager, cp_ProviderMethods, providerMethods);
    await createList(dataSource.manager, cp_TransactionConfigs, transactionConfigs);
    await createList(dataSource.manager, cp_Fields, fields);
    await createList(dataSource.manager, cp_ProviderFields, providerFields);
  }
}
