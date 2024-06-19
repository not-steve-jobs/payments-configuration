import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCpCredentials1699872689097 implements MigrationInterface {
  public name = 'AddCpCredentials1699872689097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE \`cp_credentials\` (
          \`id\` varchar(36) NOT NULL,
          \`providerCode\` varchar(50) NOT NULL,
          \`authorityFullCode\` varchar(20) NULL,
          \`countryIso2\` varchar(2) NULL,
          \`currencyIso3\` varchar(3) NULL,
          \`key\` varchar(255) NOT NULL,
          \`value\` text NOT NULL,
          \`createdAt\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          \`createdBy\` varchar(100) NOT NULL DEFAULT '',
          \`updatedBy\` varchar(100) NOT NULL DEFAULT '',
          UNIQUE INDEX \`CPСUniqueProviderAuthorityCountryCurrencyKeyIdx\` (
            \`providerCode\`, \`authorityFullCode\`, \`countryIso2\`, \`currencyIso3\`, \`key\`
          ),
          CONSTRAINT \`fkCPCProviderCodeIdx\` FOREIGN KEY (\`providerCode\`) REFERENCES \`cp_providers\`(\`code\`) ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT \`fkCPCAuthorityFullCodeIdx\` FOREIGN KEY (\`authorityFullCode\`) REFERENCES \`cp_authorities\`(\`fullCode\`)
            ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT \`fkCPCCountryIso2Idx\` FOREIGN KEY (\`countryIso2\`) REFERENCES \`cp_countries\`(\`iso2\`) ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT \`fkCPCCurrencyIso3Idx\` FOREIGN KEY (\`currencyIso3\`) REFERENCES \`cp_currencies\`(\`iso3\`) ON DELETE RESTRICT ON UPDATE CASCADE,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_credentials\` DROP FOREIGN KEY \`fkCPCCurrencyIso3Idx\``);
    await queryRunner.query(`ALTER TABLE \`cp_credentials\` DROP FOREIGN KEY \`fkCPCCountryIso2Idx\``);
    await queryRunner.query(`ALTER TABLE \`cp_credentials\` DROP FOREIGN KEY \`fkCPCAuthorityFullCodeIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_credentials\` DROP FOREIGN KEY \`fkCPCProviderCodeIdx\``);
    await queryRunner.query(`DROP INDEX \`CPСUniqueProviderAuthorityCountryCurrencyKeyIdx\` ON \`cp_credentials\``);
    await queryRunner.query(`DROP TABLE \`cp_credentials\``);
  }
}
