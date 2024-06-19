import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProviderMethodVersions1712306416198 implements MigrationInterface {
  public name = DropProviderMethodVersions1712306416198.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE cp_providerMethodVersions`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE \`cp_providerMethodVersions\` (
          \`platformId\` varchar(36) NOT NULL,
          \`providerMethodId\` varchar(36) NOT NULL,
          \`isEnabled\` tinyint(1) NOT NULL DEFAULT '1',
          UNIQUE INDEX \`CPPMVUniquePlatformProviderMethod\` (\`platformId\`, \`providerMethodId\`),
          PRIMARY KEY (\`platformId\`, \`providerMethodId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`);
  }
}
