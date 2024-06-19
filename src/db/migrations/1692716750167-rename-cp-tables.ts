import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCpTables1692716750167 implements MigrationInterface {
  public readonly name = RenameCpTables1692716750167.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`RENAME TABLE cp_methodsByCountryAuthority TO cp_countryAuthorityMethods`),
      queryRunner.query(`RENAME TABLE cp_providerMethodTransactionsConfigs TO cp_transactionConfigs`),
      queryRunner.query(`RENAME TABLE cp_providerMethodFieldOptions TO cp_fieldOptions`),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`RENAME TABLE cp_countryAuthorityMethods TO cp_methodsByCountryAuthority`),
      queryRunner.query(`RENAME TABLE cp_transactionConfigs TO cp_providerMethodTransactionsConfigs`),
      queryRunner.query(`RENAME TABLE cp_fieldOptions TO cp_providerMethodFieldOptions`),
    ]);
  }
}
