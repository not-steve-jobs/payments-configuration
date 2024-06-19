import { MigrationInterface, QueryRunner } from 'typeorm';

export class CpProvidersAddIsEnabled1706603258459 implements MigrationInterface {
  public readonly name = CpProvidersAddIsEnabled1706603258459.name;
  private readonly tableName = 'cp_providers';
  private readonly columnName = 'isEnabled';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ${this.tableName} ADD COLUMN ${this.columnName} tinyint(1) NOT NULL DEFAULT 1`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ${this.tableName} DROP COLUMN ${this.columnName}`);
  }
}
