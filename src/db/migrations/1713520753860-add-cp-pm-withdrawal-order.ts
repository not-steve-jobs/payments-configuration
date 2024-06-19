import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCpPMWithdrawalOrder1713520753860 implements MigrationInterface {
  public name = 'AddCpPMWithdrawalOrder1713520753860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` ADD \`refundsOrder\` int NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` ADD \`payoutsOrder\` int NOT NULL DEFAULT '1'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`payoutsOrder\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`refundsOrder\``);
  }
}
