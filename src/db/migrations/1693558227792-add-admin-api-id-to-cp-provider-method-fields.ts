import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminApiIdToCpProviderMethodFields1693558227792 implements MigrationInterface {
  public name = 'AddAdminApiIdToCpProviderMethodFields1693558227792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`adminApiId\` int NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPPMFUniqueProviderMethodIdAdminApiId\` ON \`cp_providerMethodFields\` (\`providerMethodId\`, \`adminApiId\`)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`adminApiId\``);
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query(`DROP INDEX \`CPPMFUniqueProviderMethodIdAdminApiId\` ON \`cp_providerMethodFields\``);
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}
