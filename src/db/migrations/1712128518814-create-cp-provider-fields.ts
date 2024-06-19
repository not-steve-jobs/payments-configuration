import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCpProviderFields1712128518814 implements MigrationInterface {
  public name = 'CreateCpProviderFields1712128518814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`cp_providerFields\`
      (
        \`id\`                int          NOT NULL AUTO_INCREMENT,
        \`providerCode\`      varchar(100) NOT NULL,
        \`countryIso2\`       varchar(2)   NULL,
        \`authorityFullCode\` varchar(20)  NULL,
        \`currencyIso3\`      varchar(3)   NULL,
        \`transactionType\`   varchar(20)  NOT NULL,
        \`fields\`             longtext     NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fkCPPFProviderCodeIdx\` FOREIGN KEY (\`providerCode\`) REFERENCES \`cp_providers\` (\`code\`)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fkCPPFAuthorityFullCodeIdx\` FOREIGN KEY (\`authorityFullCode\`) REFERENCES \`cp_authorities\` (\`fullCode\`)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fkCPPFCountryIso2Idx\` FOREIGN KEY (\`countryIso2\`) REFERENCES \`cp_countries\` (\`iso2\`)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fkCPPFCurrencyIso3Idx\` FOREIGN KEY (\`currencyIso3\`) REFERENCES \`cp_currencies\` (\`iso3\`)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`cp_providerFields\``);
  }
}
