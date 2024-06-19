import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStpRulesAndProviderRules1711456017506 implements MigrationInterface {
  public name = CreateStpRulesAndProviderRules1711456017506.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE cp_stpRules (
      id INT NOT NULL AUTO_INCREMENT,
      \`key\` VARCHAR(100) NOT NULL,
      description TEXT NULL,
      \`order\` INT NOT NULL,
      data LONGTEXT NULL,
      createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE INDEX cpStpRules_key_unique (\`key\`),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);

    await queryRunner.query(`CREATE TABLE cp_stpProviderRules (
      id INT NOT NULL AUTO_INCREMENT,
      providerCode VARCHAR(100) NOT NULL,
      authorityFullCode VARCHAR(20) NOT NULL,
      countryIso2 VARCHAR(2) NULL,
      stpRuleKey VARCHAR(100) NOT NULL,
      data LONGTEXT NULL,
      isEnabled TINYINT(1) NOT NULL DEFAULT 1,
      PRIMARY KEY (id),
      CONSTRAINT fkCPSTPRuleProviderCodeIdx FOREIGN KEY (providerCode) REFERENCES cp_providers(\`code\`) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fkCPSTPRuleAuthorityFullCodeIdx FOREIGN KEY (authorityFullCode) REFERENCES cp_authorities(\`fullCode\`) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fkCPSTPRuleCountryIso2Idx FOREIGN KEY (countryIso2) REFERENCES cp_countries(\`iso2\`) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fkCPSTPRuleKeyIdx FOREIGN KEY (stpRuleKey) REFERENCES cp_stpRules(\`key\`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE cp_stpProviderRules`);
    await queryRunner.query(`DROP TABLE cp_stpRules`);
  }
}
