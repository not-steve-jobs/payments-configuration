import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCPSettingsTables1699863903324 implements MigrationInterface {
  public name = 'AddCPSettingsTables1699863903324';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE \`cp_platforms\` (
          \`id\` varchar(36) NOT NULL,
          \`name\` varchar(10) NOT NULL,
          \`version\` varchar(30) NOT NULL,
          \`date\` timestamp NULL,
          UNIQUE INDEX \`CPPUniquePlatformNameVersion\` (\`name\`, \`version\`),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`);
    await queryRunner.query(`
        CREATE TABLE \`cp_providerMethodVersions\` (
          \`platformId\` varchar(36) NOT NULL,
          \`providerMethodId\` varchar(36) NOT NULL,
          \`isEnabled\` tinyint(1) NOT NULL DEFAULT '1',
          UNIQUE INDEX \`CPPMVUniquePlatformProviderMethod\` (\`platformId\`, \`providerMethodId\`),
          PRIMARY KEY (\`platformId\`, \`providerMethodId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`);
    await queryRunner.query(`
        ALTER TABLE \`cp_providerMethodVersions\`
        ADD CONSTRAINT \`fkCPPVMProviderMethodIdx\`
        FOREIGN KEY (\`providerMethodId\`)
        REFERENCES \`cp_providerMethods\`(\`id\`)
        ON DELETE RESTRICT ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodVersions\` DROP FOREIGN KEY \`fkCPPVMProviderMethodIdx\``);
    await queryRunner.query(`DROP INDEX \`CPPMVUniquePlatformProviderMethod\` ON \`cp_providerMethodVersions\``);
    await queryRunner.query(`DROP TABLE \`cp_providerMethodVersions\``);
    await queryRunner.query(`DROP INDEX \`CPPUniquePlatformNameVersion\` ON \`cp_platforms\``);
    await queryRunner.query(`DROP TABLE \`cp_platforms\``);
  }
}
