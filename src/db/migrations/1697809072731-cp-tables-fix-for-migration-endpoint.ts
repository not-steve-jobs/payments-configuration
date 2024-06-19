import { MigrationInterface, QueryRunner } from 'typeorm';

export class CpTablesFixForMigrationEndpoint1697809072731 implements MigrationInterface {
  public name = CpTablesFixForMigrationEndpoint1697809072731.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_countries\` MODIFY \`group\` varchar(30) NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_transactionConfigs\` MODIFY \`period\` int(4) UNSIGNED NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`defaultValue\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`pattern\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`value\` varchar(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_countries\` MODIFY \`group\` varchar(30) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_transactionConfigs\` MODIFY \`period\` tinyint(4) UNSIGNED NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`defaultValue\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`pattern\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`value\` varchar(255) NOT NULL`);
  }
}
