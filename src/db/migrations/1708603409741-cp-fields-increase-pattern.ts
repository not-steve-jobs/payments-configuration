import { MigrationInterface, QueryRunner } from 'typeorm';

export class CPFieldsIncreasePattern1708603409741 implements MigrationInterface {
  public name = 'CPFieldsIncreasePattern1708603409741';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE cp_fields CHANGE pattern pattern varchar(700) NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE cp_fields CHANGE pattern pattern varchar(255) NOT NULL');
  }
}
