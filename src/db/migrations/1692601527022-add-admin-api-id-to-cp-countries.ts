import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminAdminToCpCountries1692601527022 implements MigrationInterface {
  public name = 'AddAdminAdminToCpCountries1692601527022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_countries\` ADD \`adminApiId\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_countries\` DROP COLUMN \`adminApiId\``);
  }
}
