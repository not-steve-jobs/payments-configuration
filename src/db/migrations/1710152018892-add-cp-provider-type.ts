import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCpProvidersType1710152018892 implements MigrationInterface {
  public name = 'AddCpProvidersType1710152018892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` ADD \`type\` varchar(20) NOT NULL DEFAULT 'default'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` DROP COLUMN \`type\``);
  }
}
