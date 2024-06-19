import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepositsOrderToCpCaMethods1706605751573 implements MigrationInterface {
  public readonly name = 'AddDepositsOrderToCpCaMethods1706605751573';
  private readonly tableName = 'cp_countryAuthorityMethods';
  private readonly columnName = 'depositsOrder';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ${this.tableName} ADD ${this.columnName} int UNSIGNED NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ${this.tableName} DROP COLUMN ${this.columnName}`);
  }
}
