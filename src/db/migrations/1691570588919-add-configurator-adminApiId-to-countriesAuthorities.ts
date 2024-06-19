import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfiguratorAdminApiIdToCountriesAuthorities1691570588919 implements MigrationInterface {
  public name = 'AddConfiguratorAdminApiIdToCountriesAuthorities1691570588919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_countriesAuthorities\` ADD \`adminApiId\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_countriesAuthorities\` DROP COLUMN \`adminApiId\``);
  }
}
