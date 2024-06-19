import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCpBankAccountsTable1709714882762 implements MigrationInterface {
  public name = 'AddCpBankAccountsTable1709714882762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`cp_bankAccounts\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(100) NOT NULL,
          \`type\` varchar(50) NOT NULL,
          \`providerCode\` varchar(100) NOT NULL,
          \`authorityFullCode\` varchar(20) NOT NULL,
          \`countryIso2\` varchar(2) NULL,
          \`currencyIso3\` varchar(3) NOT NULL,
          \`configs\` longtext NOT NULL,
          PRIMARY KEY (\`id\`),
          CONSTRAINT \`fkCPBAProviderCodeIdx\` FOREIGN KEY (\`providerCode\`)
            REFERENCES \`cp_providers\`(\`code\`) ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT \`fkCPBAAuthorityFullCodeIdx\` FOREIGN KEY (\`authorityFullCode\`)
            REFERENCES \`cp_authorities\`(\`fullCode\`) ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT \`fkCPBACountryIso2Idx\` FOREIGN KEY (\`countryIso2\`)
            REFERENCES \`cp_countries\`(\`iso2\`) ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT \`fkCPBACurrencyIso3Idx\` FOREIGN KEY (\`currencyIso3\`)
            REFERENCES \`cp_currencies\`(\`iso3\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_bankAccounts\` DROP FOREIGN KEY \`fkCPBACurrencyIso3Idx\``);
    await queryRunner.query(`ALTER TABLE \`cp_bankAccounts\` DROP FOREIGN KEY \`fkCPBACountryIso2Idx\``);
    await queryRunner.query(`ALTER TABLE \`cp_bankAccounts\` DROP FOREIGN KEY \`fkCPBAAuthorityFullCodeIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_bankAccounts\` DROP FOREIGN KEY \`fkCPBAProviderCodeIdx\``);
    await queryRunner.query(`DROP TABLE \`cp_bankAccounts\``);
  }
}
