import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfiguratorTables1689520051405 implements MigrationInterface {
  public name = AddConfiguratorTables1689520051405.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`cp_authorities\`
                             (
                               \`fullCode\` varchar(20)  NOT NULL,
                               \`name\`     varchar(100) NOT NULL,
                               UNIQUE INDEX \`CPAUniqueFullCode\` (\`fullCode\`),
                               PRIMARY KEY (\`fullCode\`)
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_countries\`
                             (
                               \`iso2\`  varchar(2)  NOT NULL,
                               \`iso3\`  varchar(3)  NOT NULL,
                               \`name\`  varchar(60) NOT NULL,
                               \`group\` varchar(30) NOT NULL,
                               UNIQUE INDEX \`CPCUniqueName\` (\`name\`),
                               UNIQUE INDEX \`CPCUniqueIso3\` (\`iso3\`),
                               UNIQUE INDEX \`CPCUniqueIso2\` (\`iso2\`),
                               UNIQUE INDEX \`IDX-CP_COUNTRIES-ISO3\` (\`iso3\`),
                               UNIQUE INDEX \`IDX-CP_COUNTRIES-NAME\` (\`name\`),
                               PRIMARY KEY (\`iso2\`)
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_countriesAuthorities\`
                             (
                               \`id\`                varchar(36) NOT NULL,
                               \`authorityFullCode\` varchar(20) NOT NULL,
                               \`countryIso2\`       varchar(2)  NOT NULL,
                               UNIQUE INDEX \`CPCAUniqueIso2FullCode\` (\`countryIso2\`, \`authorityFullCode\`),
                               PRIMARY KEY (\`id\`),
                               CONSTRAINT \`fkCPCAAuthorityFullCodeIdx\` FOREIGN KEY (\`authorityFullCode\`)
                                 REFERENCES \`cp_authorities\` (\`fullCode\`) ON DELETE RESTRICT ON UPDATE CASCADE,
                               CONSTRAINT \`fkCPCACountryIso2Idx\` FOREIGN KEY (\`countryIso2\`)
                                 REFERENCES \`cp_countries\` (\`iso2\`) ON DELETE RESTRICT ON UPDATE CASCADE
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_currencies\`
                             (
                               \`iso3\` varchar(3)   NOT NULL,
                               \`iso2\` varchar(2)   NOT NULL,
                               \`name\` varchar(100) NOT NULL,
                               UNIQUE INDEX \`IDX-CP_CURRENCIES-ISO2\` (\`iso2\`),
                               UNIQUE INDEX \`IDX-CP_CURRENCIES-NAME\` (\`name\`),
                               PRIMARY KEY (\`iso3\`)
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_methods\`
                             (
                               \`id\`            varchar(36)  NOT NULL,
                               \`code\`          varchar(20)  NOT NULL,
                               \`name\`          varchar(100) NOT NULL,
                               \`description\`   text         NOT NULL,
                               \`credentialsId\` varchar(36)  NULL,
                               \`createdAt\`     timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               \`updatedAt\`     timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP,
                               \`createdBy\`     varchar(100) NOT NULL,
                               \`updatedBy\`     varchar(100) NOT NULL,
                               UNIQUE INDEX \`IDX-CP_METHODS-CODE\` (\`code\`),
                               UNIQUE INDEX \`IDX-CP_METHODS-NAME\` (\`name\`),
                               PRIMARY KEY (\`id\`)
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_providers\`
                             (
                               \`id\`          varchar(36)  NOT NULL,
                               \`name\`        varchar(100) NOT NULL,
                               \`code\`        varchar(20)  NOT NULL,
                               \`description\` text         NULL,
                               \`createdAt\`   timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               \`updatedAt\`   timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP,
                               \`createdBy\`   varchar(100) NOT NULL,
                               \`updatedBy\`   varchar(100) NOT NULL,
                               UNIQUE INDEX \`IDX-CP_PROVIDERS-CODE\` (\`code\`),
                               PRIMARY KEY (\`id\`)
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_methodsByCountryAuthority\`
                             (
                               \`id\`                 varchar(36)  NOT NULL,
                               \`methodId\`           varchar(36)  NOT NULL,
                               \`countryAuthorityId\` varchar(36)  NOT NULL,
                               \`isEnabled\`          tinyint(1)   NOT NULL DEFAULT '1',
                               \`createdAt\`          timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               \`updatedAt\`          timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP,
                               \`createdBy\`          varchar(100) NOT NULL,
                               \`updatedBy\`          varchar(100) NOT NULL,
                               UNIQUE INDEX \`CPMBCAUniqueMethodIdCountryAuthorityId\` (\`methodId\`, \`countryAuthorityId\`),
                               PRIMARY KEY (\`id\`),
                               CONSTRAINT \`fkCPMBCAMethodIdIdx\` FOREIGN KEY (\`methodId\`)
                                 REFERENCES \`cp_methods\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
                               CONSTRAINT \`fkCPMBCACountryAuthorityIdIdx\` FOREIGN KEY (\`countryAuthorityId\`)
                                 REFERENCES \`cp_countriesAuthorities\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_providerMethods\`
                             (
                               \`id\`                         varchar(36)  NOT NULL,
                               \`methodByCountryAuthorityId\` varchar(36)  NOT NULL,
                               \`providerId\`                 varchar(36)  NOT NULL,
                               \`isStpRestricted\`            tinyint(1)   NULL,
                               \`credentialsId\`              varchar(36)  NULL,
                               \`isEnabled\`                  tinyint(1)   NOT NULL DEFAULT '1',
                               \`createdAt\`                  timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               \`updatedAt\`                  timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP,
                               \`createdBy\`                  varchar(100) NOT NULL,
                               \`updatedBy\`                  varchar(100) NOT NULL,
                               UNIQUE INDEX \`CPPMUniqueProviderIdMethodByCountryAuthorityId\` (\`providerId\`, \`methodByCountryAuthorityId\`),
                               PRIMARY KEY (\`id\`),
                               CONSTRAINT \`fkCPPMMethodByCountryAuthorityId\` FOREIGN KEY (\`methodByCountryAuthorityId\`)
                                 REFERENCES \`cp_methodsByCountryAuthority\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
                               CONSTRAINT \`fkCPPMProviderIdIdIdx\` FOREIGN KEY (\`providerId\`)
                                 REFERENCES \`cp_providers\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`CREATE TABLE \`cp_providerMethodTransactionsConfigs\`
                             (
                               \`id\`               varchar(36)             NOT NULL,
                               \`providerMethodId\` varchar(36)             NOT NULL,
                               \`currencyIso3\`     varchar(3)              NOT NULL,
                               \`type\`             varchar(20)             NOT NULL,
                               \`minAmount\`        decimal(20, 4)     UNSIGNED NULL,
                               \`maxAmount\`        decimal(20, 4)     UNSIGNED NULL,
                               \`period\`           tinyint(3)         UNSIGNED NULL,
                               \`isEnabled\`        tinyint(1)              NOT NULL DEFAULT '1',
                               \`createdAt\`        timestamp(3)            NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               \`updatedAt\`        timestamp(3)            NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP,
                               \`createdBy\`        varchar(100)            NOT NULL,
                               \`updatedBy\`        varchar(100)            NOT NULL,
                               UNIQUE INDEX \`CPPMTCUniqueProviderMethodIdCurrencyIso3TypeIdx\` (\`providerMethodId\`, \`currencyIso3\`, \`type\`),
                               PRIMARY KEY (\`id\`),
                               CONSTRAINT \`fkCPPMTCProviderMethodIdx\` FOREIGN KEY (\`providerMethodId\`)
                                 REFERENCES \`cp_providerMethods\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
                               CONSTRAINT \`fkCPPMTCCurrencyIso3Idx\` FOREIGN KEY (\`currencyIso3\`)
                                 REFERENCES \`cp_currencies\` (\`iso3\`) ON DELETE RESTRICT ON UPDATE CASCADE
                             ) ENGINE = InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodTransactionsConfigs\`
      DROP FOREIGN KEY \`fkCPPMTCCurrencyIso3Idx\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodTransactionsConfigs\`
      DROP FOREIGN KEY \`fkCPPMTCProviderMethodIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\`
      DROP FOREIGN KEY \`fkCPPMProviderIdIdIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\`
      DROP FOREIGN KEY \`fkCPPMMethodByCountryAuthorityId\``);
    await queryRunner.query(`ALTER TABLE \`cp_methodsByCountryAuthority\`
      DROP FOREIGN KEY \`fkCPMBCACountryAuthorityIdIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_methodsByCountryAuthority\`
      DROP FOREIGN KEY \`fkCPMBCAMethodIdIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_countriesAuthorities\`
      DROP FOREIGN KEY \`fkCPCACountryIso2Idx\``);
    await queryRunner.query(`ALTER TABLE \`cp_countriesAuthorities\`
      DROP FOREIGN KEY \`fkCPCAAuthorityFullCodeIdx\``);
    await queryRunner.query(
      `DROP INDEX \`CPPMTCUniqueProviderMethodIdCurrencyIso3TypeIdx\` ON \`cp_providerMethodTransactionsConfigs\``
    );
    await queryRunner.query(`DROP TABLE \`cp_providerMethodTransactionsConfigs\``);
    await queryRunner.query(`DROP INDEX \`CPPMUniqueProviderIdMethodByCountryAuthorityId\` ON \`cp_providerMethods\``);
    await queryRunner.query(`DROP TABLE \`cp_providerMethods\``);
    await queryRunner.query(
      `DROP INDEX \`CPMBCAUniqueMethodIdCountryAuthorityId\` ON \`cp_methodsByCountryAuthority\``
    );
    await queryRunner.query(`DROP TABLE \`cp_methodsByCountryAuthority\``);
    await queryRunner.query(`DROP INDEX \`IDX-CP_PROVIDERS-CODE\` ON \`cp_providers\``);
    await queryRunner.query(`DROP TABLE \`cp_providers\``);
    await queryRunner.query(`DROP INDEX \`IDX-CP_METHODS-NAME\` ON \`cp_methods\``);
    await queryRunner.query(`DROP INDEX \`IDX-CP_METHODS-CODE\` ON \`cp_methods\``);
    await queryRunner.query(`DROP TABLE \`cp_methods\``);
    await queryRunner.query(`DROP INDEX \`IDX-CP_CURRENCIES-NAME\` ON \`cp_currencies\``);
    await queryRunner.query(`DROP INDEX \`IDX-CP_CURRENCIES-ISO2\` ON \`cp_currencies\``);
    await queryRunner.query(`DROP TABLE \`cp_currencies\``);
    await queryRunner.query(`DROP INDEX \`CPCAUniqueIso2FullCode\` ON \`cp_countriesAuthorities\``);
    await queryRunner.query(`DROP TABLE \`cp_countriesAuthorities\``);
    await queryRunner.query(`DROP INDEX \`IDX-CP_COUNTRIES-NAME\` ON \`cp_countries\``);
    await queryRunner.query(`DROP INDEX \`IDX-CP_COUNTRIES-ISO3\` ON \`cp_countries\``);
    await queryRunner.query(`DROP INDEX \`CPCUniqueIso2\` ON \`cp_countries\``);
    await queryRunner.query(`DROP INDEX \`CPCUniqueIso3\` ON \`cp_countries\``);
    await queryRunner.query(`DROP INDEX \`CPCUniqueName\` ON \`cp_countries\``);
    await queryRunner.query(`DROP TABLE \`cp_countries\``);
    await queryRunner.query(`DROP INDEX \`CPAUniqueFullCode\` ON \`cp_authorities\``);
    await queryRunner.query(`DROP TABLE \`cp_authorities\``);
  }
}
