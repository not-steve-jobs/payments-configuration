import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProviderMethodVersions1702292941708 implements MigrationInterface {
  public readonly name = AlterProviderMethodVersions1702292941708.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cp_providerMethodVersions
      ADD COLUMN platformName varchar(10) NOT NULL,
      DROP INDEX CPPMVUniquePlatformProviderMethod,
      DROP PRIMARY KEY,
      DROP COLUMN platformId,
      ADD COLUMN settings longtext NOT NULL,
      ADD UNIQUE INDEX CPPMVUniquePlatformProviderMethod (platformName, providerMethodId),
      ADD PRIMARY KEY (\`platformName\`, \`providerMethodId\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cp_providerMethodVersions
      DROP COLUMN settings,
      ADD COLUMN platformId varchar(36) NOT NULL,
      DROP INDEX CPPMVUniquePlatformProviderMethod,
      ADD UNIQUE INDEX CPPMVUniquePlatformProviderMethod (platformId, providerMethodId),
      DROP PRIMARY KEY,
      DROP COLUMN platformName,
      ADD PRIMARY KEY (\`platformId\`, \`providerMethodId\`)
    `);
  }
}
