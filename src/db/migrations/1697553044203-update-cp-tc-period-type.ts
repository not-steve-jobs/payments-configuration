import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCpTcPeriodType1697553044203 implements MigrationInterface {
  public name = 'UpdateCpTcPeriodType1697553044203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_transactionConfigs\` MODIFY COLUMN \`period\` INT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_transactionConfigs\` MODIFY COLUMN \`period\` TINYINT(4) NULL`);
  }
}
