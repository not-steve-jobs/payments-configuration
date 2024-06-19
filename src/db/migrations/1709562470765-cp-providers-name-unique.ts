import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1709562470765 implements MigrationInterface {
  public name = 'MigrationName1709562470765';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` ADD UNIQUE INDEX \`CPPUniqueName\` (\`name\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` DROP INDEX \`CPPUniqueName\``);
  }
}
