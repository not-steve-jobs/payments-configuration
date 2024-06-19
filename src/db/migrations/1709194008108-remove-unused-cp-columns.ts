import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedCPColumns1709194008108 implements MigrationInterface {
  public name = 'RemoveUnusedCPColumns1709194008108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`convertedCurrency\``);
    await queryRunner.query(`ALTER TABLE \`cp_transactionConfigs\` DROP COLUMN \`isPaymentAccountRequired\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cp_transactionConfigs\` ADD \`isPaymentAccountRequired\` tinyint(1) NOT NULL DEFAULT 0`
    );
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` ADD \`convertedCurrency\` varchar(3) NULL`);
  }
}
