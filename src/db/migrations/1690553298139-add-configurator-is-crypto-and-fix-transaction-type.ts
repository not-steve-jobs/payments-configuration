import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfiguratorIsCryptoAndFixTransactionType1690553298139 implements MigrationInterface {
  public name = 'AddConfiguratorIsCryptoAndFixTransactionType1690553298139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` ADD \`isCrypto\` tinyint(1) NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`transactionType\` varchar(20) NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY \`transactionType\` varchar(256) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providers\` DROP COLUMN \`isCrypto\``);
  }
}
