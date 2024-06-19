import { MariaDBDataSource, MariaDbDataSourceOptions } from './mariadb-data-source';

describe('KnexDataSource', () => {
  it('Should return instance', () => {
    const options = mock<MariaDbDataSourceOptions>({
      config: { mysql: {} },
    });

    const dataSource = new MariaDBDataSource(options);

    expect(dataSource.getDataSource()).toBeInstanceOf(Function);
  });
});
