import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

import { buildConfig } from '../infrastructure/config/build-config';

const configName = process.env.ENV_PROPERTIES || 'env.properties';
const appRoot = path.join(__dirname, '../..');

const config = buildConfig(appRoot, configName);

export const DatabaseConfig: DataSourceOptions & SeederOptions = {
  type: 'mariadb',
  host: config.mysql.host,
  username: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  entities: ['src/db/entity/*.{ts,js}'],
  migrations: ['src/db/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
  timezone: config.mysql.timezone,
  multipleStatements: true,
  poolSize: config.mysql.connectionLimit,
  seeds: ['src/db/seeds/*.{ts,js}'],
};

export default new DataSource(DatabaseConfig);
