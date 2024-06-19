import { PaymentsConfigurationManagementServiceConfig } from '@core/contracts/infrastructure';

import { KnexDataSource } from './knex-data-source';

export interface MariaDbDataSourceOptions {
  config: PaymentsConfigurationManagementServiceConfig;
}

export class MariaDBDataSource extends KnexDataSource {
  constructor({ config: { mysql } }: MariaDbDataSourceOptions) {
    super({
      client: 'mysql',
      connection: {
        host: mysql.host,
        user: mysql.user,
        password: mysql.password,
        database: mysql.database,
        timezone: mysql.timezone,
        multipleStatements: true,
        // eslint-disable-next-line
        typeCast: (field: any, next: any) => {
          if (field.type === 'TINY' && field.length === 1) {
            const value = field.string();
            return value ? value === '1' : null;
          }
          else if (field.type === 'TIMESTAMP') {
            const date = new Date(field.string());
            const msInUTCFormat = Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
              date.getSeconds(),
              date.getMilliseconds()
            );
            return new Date(msInUTCFormat).toISOString();
          }
          else {
            return next();
          }
        },
      },
      pool: {
        min: 0,
        max: mysql.connectionLimit,
      },
    });
  }
}
