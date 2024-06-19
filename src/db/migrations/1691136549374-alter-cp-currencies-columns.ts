import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCpCurrenciesColumns1691136549374 implements MigrationInterface {
  public name = 'AlterCpCurrenciesColumns1691136549374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_currencies\` DROP COLUMN \`iso2\``);
    await queryRunner.query(`ALTER TABLE \`cp_currencies\` DROP COLUMN \`name\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_currencies\` ADD \`name\` varchar(100) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_currencies\` ADD \`iso2\` varchar(2) NOT NULL`);
  }
}
