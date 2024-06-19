import { MigrationInterface, QueryRunner } from 'typeorm';

export class CpProviderFieldsUniqueIdx1712916941128 implements MigrationInterface {
  public name = 'CpProviderFieldsUniqueIdx1712916941128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX CPPFUniqueProviderCountryAuthorityCurrencyIdx
      ON cp_providerFields (providerCode, countryIso2, authorityFullCode, currencyIso3)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX fkCPPFProviderCodeIdx ON cp_providerFields (providerCode)`);
    await queryRunner.query(`DROP INDEX CPPFUniqueProviderCountryAuthorityCurrencyIdx ON cp_providerFields`);
  }
}
