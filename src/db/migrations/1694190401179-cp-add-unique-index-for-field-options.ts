import { MigrationInterface, QueryRunner } from 'typeorm';

export class CpAddUniqueIndexForFieldOptions1694190401179 implements MigrationInterface {
  public name = 'CpAddUniqueIndexForFieldOptions1694190401179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` DROP COLUMN \`key\``);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` ADD \`key\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` DROP COLUMN \`value\``);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` ADD \`value\` varchar(255) NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPFOUniqueFieldKeyValue\` ON \`cp_fieldOptions\` (\`providerMethodFieldId\`, \`key\`, \`value\`)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query(`DROP INDEX \`CPFOUniqueFieldKeyValue\` ON \`cp_fieldOptions\``);
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` DROP COLUMN \`value\``);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` ADD \`value\` varchar(256) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` DROP COLUMN \`key\``);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` ADD \`key\` varchar(256) NOT NULL`);
  }
}
