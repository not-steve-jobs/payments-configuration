import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterConfiguratorTables1692021876896 implements MigrationInterface {
  public name = 'AlterConfiguratorTables1692021876896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_methods\` DROP COLUMN \`credentialsId\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`isStpRestricted\``);
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD \`isPaymentAccountRequired\` tinyint(1) NOT NULL DEFAULT '1'`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD \`isPayoutAsRefund\` tinyint(1) NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`convertedCurrency\` varchar(3) NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodTransactionsConfigs\` ADD \`order\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodTransactionsConfigs\` DROP COLUMN \`order\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`convertedCurrency\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`isPayoutAsRefund\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`isPaymentAccountRequired\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` ADD \`isStpRestricted\` tinyint(1) NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_methods\` ADD \`credentialsId\` varchar(36) NULL`);
  }
}
