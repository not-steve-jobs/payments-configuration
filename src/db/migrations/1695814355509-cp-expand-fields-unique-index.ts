import { MigrationInterface, QueryRunner } from 'typeorm';

export class CpExpandFieldsUniqueIndex1695814355509 implements MigrationInterface {
  public name = 'CpExpandFieldsUniqueIndex1695814355509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`key\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`key\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`valueType\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`valueType\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`value\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`value\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`defaultValue\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`defaultValue\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`pattern\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`pattern\` varchar(255) NOT NULL`);
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query(`DROP INDEX \`CPPMFUniqueProviderMethodIdAdminApiId\` ON \`cp_providerMethodFields\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPPMFUniqueProviderMethodIdAdminApiIdKey\` ON \`cp_providerMethodFields\` (\`providerMethodId\`, \`key\`, \`adminApiId\`)`
    );
    await queryRunner.query(`DROP INDEX \`CPFOUniqueFieldKeyValue\` ON \`cp_fieldOptions\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPFOUniqueFieldKey\` ON \`cp_fieldOptions\` (\`providerMethodFieldId\`, \`key\`)`
    );
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query(`DROP INDEX \`CPPMFUniqueProviderMethodIdAdminApiIdKey\` ON \`cp_providerMethodFields\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPPMFUniqueProviderMethodIdAdminApiId\` ON \`cp_providerMethodFields\` (\`providerMethodId\`, \`adminApiId\`)`
    );
    await queryRunner.query(`DROP INDEX \`CPFOUniqueFieldKey\` ON \`cp_fieldOptions\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPFOUniqueFieldKeyValue\` ON \`cp_fieldOptions\` (\`providerMethodFieldId\`, \`key\`, \`value\`)`
    );
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`pattern\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`pattern\` varchar(256) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`defaultValue\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`defaultValue\` varchar(256) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`value\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`value\` varchar(256) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`valueType\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`valueType\` varchar(256) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`key\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`key\` varchar(256) NOT NULL`);
  }
}
