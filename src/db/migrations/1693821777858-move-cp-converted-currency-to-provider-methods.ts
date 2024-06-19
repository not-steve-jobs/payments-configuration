import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveCpConvertedCurrencyToProviderMethods1693821777858 implements MigrationInterface {
  public name = 'MoveCpConvertedCurrencyToProviderMethods1693821777858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`convertedCurrency\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` ADD \`convertedCurrency\` varchar(3) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`convertedCurrency\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`convertedCurrency\` varchar(3) NULL`);
  }
}
