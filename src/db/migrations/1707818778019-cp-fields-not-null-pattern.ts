import { MigrationInterface, QueryRunner } from 'typeorm';

export class CpFieldsNotNullPattern1707818778019 implements MigrationInterface {
  public name = 'CpFieldsNotNullPattern1707818778019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE cp_fields SET pattern = '.+' WHERE pattern = '' OR pattern IS NULL`);
    await queryRunner.query('ALTER TABLE cp_fields CHANGE pattern pattern varchar(255) NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE cp_fields CHANGE pattern pattern varchar(255) NULL');
  }
}
