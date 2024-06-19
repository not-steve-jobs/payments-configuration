import { MigrationInterface, QueryRunner } from 'typeorm';

import { tolerateQuery } from '../sql-utils/queryUtils';

export class UpdateCpFieldsUniqueIdx1702386570504 implements MigrationInterface {
  public name = 'UpdateCpFieldsUniqueIdx1702386570504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await tolerateQuery(queryRunner, `DROP INDEX \`CPFUniqueEntityTransactionTypeKey\` ON \`cp_fields\``);
    await queryRunner.query(`CREATE UNIQUE INDEX \`CPFUniqueEntityTransactionTypeKeyCurrencyIso3\`
      ON \`cp_fields\` (\`entityId\`, \`entityType\`, \`transactionType\`, \`key\`, \`currencyIso3\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await tolerateQuery(queryRunner, `DROP INDEX \`CPFUniqueEntityTransactionTypeKeyCurrencyIso3\` ON \`cp_fields\``);
    await queryRunner.query(`CREATE UNIQUE INDEX \`CPFUniqueEntityTransactionTypeKey\`
      ON \`cp_fields\` (\`entityId\`, \`entityType\`, \`transactionType\`, \`key\`)`);
  }
}
