import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCpCredentials1704215843477 implements MigrationInterface {
  public readonly name = AlterCpCredentials1704215843477.name;
  private readonly tableName = 'cp_credentials';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The table is not used by anyone, the safe op from business side.
    await queryRunner.query(`DELETE from ${this.tableName}`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX CPСUniqueProviderAuthorityCountryCurrencyIdx
      ON ${this.tableName} (providerCode, authorityFullCode, countryIso2, currencyIso3)
    `);
    await queryRunner.query(`
      ALTER TABLE ${this.tableName}
        DROP PRIMARY KEY,
        DROP INDEX \`CPСUniqueProviderAuthorityCountryCurrencyKeyIdx\`,
        DROP COLUMN id,
        DROP COLUMN createdBy,
        DROP COLUMN updatedBy,
        DROP COLUMN \`key\`,
        DROP COLUMN value,
        DROP COLUMN createdAt,
        DROP COLUMN updatedAt
    `);
    await queryRunner.query(`ALTER TABLE ${this.tableName} ADD \`id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`);
    await queryRunner.query(`ALTER TABLE ${this.tableName} ADD COLUMN credentialsDetails longtext NOT NULL `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The table is not used by anyone, the safe op from business side.
    await queryRunner.query(`DELETE from ${this.tableName}`);
    await queryRunner.query(`
      ALTER TABLE ${this.tableName}
        ADD COLUMN \`key\` varchar(255) NOT NULL AFTER currencyIso3,
        ADD COLUMN value text NOT NULL AFTER \`key\`,
        DROP PRIMARY KEY,
        DROP COLUMN id
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`CPСUniqueProviderAuthorityCountryCurrencyKeyIdx\`
      ON ${this.tableName} (\`providerCode\`, \`authorityFullCode\`, \`countryIso2\`, \`currencyIso3\`, \`key\`)
    `);
    await queryRunner.query(`
      ALTER TABLE ${this.tableName}
        DROP INDEX \`CPСUniqueProviderAuthorityCountryCurrencyIdx\`,
        ADD COLUMN createdAt timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER value,
        ADD COLUMN updatedAt timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) AFTER createdAt,
        ADD COLUMN createdBy varchar(100) NOT NULL DEFAULT '' AFTER updatedAt,
        ADD COLUMN updatedBy varchar(100) NOT NULL DEFAULT '' AFTER createdBy,
        DROP COLUMN credentialsDetails,
        ADD COLUMN id VARCHAR(36) NOT NULL FIRST,
        ADD PRIMARY KEY (id)
    `);
  }
}
