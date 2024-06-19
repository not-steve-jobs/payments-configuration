import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfiguratorAdminApiIdAndMaintenance1691147464470 implements MigrationInterface {
  public name = 'AddConfiguratorAdminApiIdAndMaintenance1691147464470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` ADD \`adminApiId\` int NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providers\` ADD \`maintenance\` tinyint(1) NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` DROP COLUMN \`maintenance\``);
    await queryRunner.query(`ALTER TABLE \`cp_providers\` DROP COLUMN \`adminApiId\``);
  }
}
