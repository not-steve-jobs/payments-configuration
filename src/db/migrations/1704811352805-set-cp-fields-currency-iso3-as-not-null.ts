import { MigrationInterface, QueryRunner } from 'typeorm';

import { tolerateQuery } from '../sql-utils/queryUtils';

export class SetCpFieldsCurrencyIso3AsNotNull1704811352805 implements MigrationInterface {
  public name = 'SetCpFieldsCurrencyIso3AsNotNull1704811352805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await tolerateQuery(queryRunner, `DROP INDEX \`CPFUniqueEntityTransactionTypeKeyCurrencyIso3\` ON \`cp_fields\``);

    await queryRunner.query(`UPDATE \`cp_fields\` SET \`currencyIso3\` = '' WHERE \`currencyIso3\` IS NULL`);

    await queryRunner.query(`ALTER TABLE \`cp_fields\`
      CHANGE \`currencyIso3\` \`currencyIso3\` varchar(3) NOT NULL DEFAULT ''`);

    await queryRunner.query(`CREATE UNIQUE INDEX \`CPFUniqueEntityTransactionTypeKeyCurrencyIso3\`
      ON \`cp_fields\` (\`entityId\`, \`entityType\`, \`transactionType\`, \`key\`, \`currencyIso3\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`CPFUniqueEntityTransactionTypeKeyCurrencyIso3\` ON \`cp_fields\``);

    await queryRunner.query(`ALTER TABLE \`cp_fields\`
      CHANGE \`currencyIso3\` \`currencyIso3\` varchar(3) NULL`);

    await queryRunner.query(`UPDATE \`cp_fields\` SET \`currencyIso3\` = NULL WHERE \`currencyIso3\` = ''`);

    await queryRunner.query(`CREATE UNIQUE INDEX \`CPFUniqueEntityTransactionTypeKeyCurrencyIso3\`
      ON \`cp_fields\` (\`entityId\`, \`entityType\`, \`transactionType\`, \`key\`, \`currencyIso3\`)`);
  }
}
