import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCpProviderRestrictions1707727884150 implements MigrationInterface {
  public name = 'AddCpProviderRestrictions1707727884150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE \`cp_providerRestrictions\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`platform\` varchar(10) NOT NULL,
            \`providerCode\` varchar(100) NOT NULL,
            \`countryAuthorityId\` varchar(36) NULL,
            \`isEnabled\` tinyint(1) NOT NULL DEFAULT '1',
            \`settings\` longtext NOT NULL,
            CONSTRAINT \`fkCPPRProviderIdx\` FOREIGN KEY (\`providerCode\`) REFERENCES \`cp_providers\`(\`code\`)
                ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT \`fkCPPRCountryAuthorityIdx\` FOREIGN KEY (\`countryAuthorityId\`) REFERENCES \`cp_countriesAuthorities\`(\`id\`)
                ON DELETE RESTRICT ON UPDATE CASCADE,
            UNIQUE INDEX \`CPPRUniquePlatformProviderCAIdx\` (\`platform\`, \`providerCode\`, \`countryAuthorityId\`),
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerRestrictions\` DROP FOREIGN KEY \`fkCPPRCountryAuthorityIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerRestrictions\` DROP FOREIGN KEY \`fkCPPRProviderIdx\``);
    await queryRunner.query(`DROP INDEX \`CPPRUniquePlatformProviderCAIdx\` ON \`cp_providerRestrictions\``);
    await queryRunner.query(`DROP TABLE \`cp_providerRestrictions\``);
  }
}
