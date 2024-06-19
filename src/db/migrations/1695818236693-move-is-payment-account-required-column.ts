import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveIsPaymentAccountRequiredColumn1695818236693 implements MigrationInterface {
  public readonly name = MoveIsPaymentAccountRequiredColumn1695818236693.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`isPaymentAccountRequired\``);
    await queryRunner.query(
      `ALTER TABLE \`cp_transactionConfigs\` ADD \`isPaymentAccountRequired\` tinyint(1) NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_transactionConfigs\` CHANGE \`period\` \`period\` tinyint(4) UNSIGNED NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cp_transactionConfigs\` CHANGE \`period\` \`period\` tinyint(3) UNSIGNED NULL`
    );
    await queryRunner.query(`ALTER TABLE \`cp_transactionConfigs\` DROP COLUMN \`isPaymentAccountRequired\``);
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD \`isPaymentAccountRequired\` tinyint(1) NOT NULL DEFAULT '0'`
    );
  }
}
