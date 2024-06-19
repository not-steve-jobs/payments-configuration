import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfiguratorFieldsTables1690288806069 implements MigrationInterface {
  public name = AddConfiguratorFieldsTables1690288806069.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`cp_providerMethodFields\`
                             (
                               \`id\` varchar(36)  NOT NULL,
                               \`providerMethodId\` varchar(36) NOT NULL,
                               \`transactionType\` varchar(256) NOT NULL,
                               \`key\` varchar(256) NOT NULL,
                               \`valueType\` varchar(256) NOT NULL,
                               \`value\` varchar(256) NOT NULL,
                               \`defaultValue\` varchar(256) NOT NULL,
                               \`pattern\` varchar(256) NOT NULL,
                               \`isMandatory\` tinyint(1) NOT NULL DEFAULT '1',
                               \`isEnabled\` tinyint(1) NOT NULL DEFAULT '1',
                               \`createdAt\`     timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               \`updatedAt\`     timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP,
                               \`createdBy\`     varchar(100) NOT NULL,
                               \`updatedBy\`     varchar(100) NOT NULL,
                               PRIMARY KEY (\`id\`),
                               CONSTRAINT \`fkPMProviderMethodId\` FOREIGN KEY (\`providerMethodId\`)
                                 REFERENCES \`cp_providerMethods\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
                             ) ENGINE = InnoDB`);

    await queryRunner.query(`CREATE TABLE \`cp_providerMethodFieldOptions\`
                             (
                               \`id\` varchar(36)  NOT NULL,
                               \`providerMethodFieldId\` varchar(36) NOT NULL,
                               \`key\` varchar(256) NOT NULL,
                               \`value\` varchar(256) NOT NULL,
                               \`isEnabled\` tinyint(1) NOT NULL DEFAULT '1',
                               PRIMARY KEY (\`id\`),
                               CONSTRAINT \`fkPMFProviderMethodFieldId\` FOREIGN KEY (\`providerMethodFieldId\`)
                                 REFERENCES \`cp_providerMethodFields\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
                             ) ENGINE = InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\`
      DROP FOREIGN KEY \`fkPMProviderMethodId\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFieldOptions\`
      DROP FOREIGN KEY \`fkPMFProviderMethodFieldId\``);

    await queryRunner.query(`DROP TABLE \`cp_providerMethodFields\``);
    await queryRunner.query(`DROP TABLE \`cp_providerMethodFieldOptions\``);
  }
}
