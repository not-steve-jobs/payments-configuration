import { MigrationInterface, QueryRunner } from 'typeorm';

export class CpMethodsDropNameConstraints1692270391124 implements MigrationInterface {
  public name = CpMethodsDropNameConstraints1692270391124.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX-CP_METHODS-NAME\` ON \`cp_methods\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX \`IDX-CP_METHODS-NAME\` ON \`cp_methods\` (\`name\`)`);
  }
}
