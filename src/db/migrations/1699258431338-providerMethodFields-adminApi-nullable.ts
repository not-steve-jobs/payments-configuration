import { MigrationInterface, QueryRunner } from 'typeorm';
import { tolerateQuery } from '../sql-utils/queryUtils';

export class ProviderMethodFieldsAdminApiNullable1699258431338 implements MigrationInterface {
  public name = ProviderMethodFieldsAdminApiNullable1699258431338.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Delete duplicates based on combination providerId + transactionType + key
    await queryRunner.query(`
        DELETE pmf1
        FROM cp_providerMethodFields pmf1
        JOIN cp_providerMethodFields pmf2
            ON pmf1.providerMethodId = pmf2.providerMethodId
            AND pmf1.transactionType = pmf2.transactionType
            AND pmf1.\`key\` = pmf2.\`key\`
            AND pmf1.adminApiId < pmf2.adminApiId;
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPPMFUniqueProviderMethodIdTypeKey\` ON \`cp_providerMethodFields\` (\`providerMethodId\`, \`transactionType\` ,\`key\`)`
    );
    await tolerateQuery(
      queryRunner,
      `DROP INDEX \`CPPMFUniqueProviderMethodIdAdminApiIdKey\` ON \`cp_providerMethodFields\``
    );
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY COLUMN \`adminApiId\` int NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPPMFUniqueProviderMethodIdAdminApiIdKey\` ON \`cp_providerMethodFields\` (\`providerMethodId\`, \`key\`, \`adminApiId\`)`
    );
    await tolerateQuery(
      queryRunner,
      `DROP INDEX \`CPPMFUniqueProviderMethodIdTypeKey\` ON \`cp_providerMethodFields\``
    );
    await queryRunner.query(`DELETE from cp_providerMethodFields where adminApiId is null`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY  COLUMN \`adminApiId\` int NOT NULL`);
  }
}
