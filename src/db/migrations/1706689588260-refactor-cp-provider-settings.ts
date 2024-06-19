import { MigrationInterface, QueryRunner } from 'typeorm';

import { tolerateQuery } from '../sql-utils/queryUtils';

async function setConvertedCurrencies(queryRunner: QueryRunner): Promise<void> {
  const convertedCurrencies: Array<{ providerId: string; convertedCurrency: string }> = await queryRunner.query(
    `SELECT providerId, convertedCurrency
       FROM cp_providerMethods
       WHERE convertedCurrency IS NOT NULL
       GROUP BY providerId`
  );

  if (!convertedCurrencies?.length) {
    return;
  }

  for (const { providerId, convertedCurrency } of convertedCurrencies) {
    await queryRunner.query('UPDATE cp_providers SET convertedCurrency = ? WHERE id = ?', [
      convertedCurrency,
      providerId,
    ]);
  }
}

async function setIsPaymentAccountRequired(queryRunner: QueryRunner): Promise<void> {
  const isPaymentAccountRequiredRows: Array<{ pmId: string }> = await queryRunner.query(
    `SELECT pm.id as pmId FROM cp_providerMethods pm
       INNER JOIN cp_transactionConfigs tc on pm.id = tc.providerMethodId
       WHERE tc.isPaymentAccountRequired = true GROUP BY pm.id`
  );

  // set isPaymentAccountRequiredRows = true for ProviderMethods which have at least one TransactionConfig with isPaymentAccountRequiredRows = true
  if (isPaymentAccountRequiredRows?.length) {
    const pmIds = isPaymentAccountRequiredRows.map(({ pmId }) => pmId);
    await queryRunner.query('UPDATE cp_providerMethods SET isPaymentAccountRequired = true WHERE id IN (?)', [pmIds]);
  }

  await setIsPaymentAccountRequiredByProvider(queryRunner, false, 'bankwire');
  await setIsPaymentAccountRequiredByProvider(queryRunner, true, 'stripe');
  await setIsPaymentAccountRequiredByProvider(queryRunner, true, 'paymentsiq');
}

async function setIsPaymentAccountRequiredByProvider(
  queryRunner: QueryRunner,
  value: boolean,
  code: string
): Promise<void> {
  await queryRunner.query(
    `UPDATE cp_providerMethods pm INNER JOIN cp_providers p ON pm.providerId = p.id SET isPaymentAccountRequired = ? WHERE p.code = ?`,
    [value, code]
  );
}

export class RefactorCpProviderSettings1706689588260 implements MigrationInterface {
  public name = 'RefactorCpProviderSettings1706689588260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` ADD \`convertedCurrency\` varchar(3) NULL`);
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD \`isPaymentAccountRequired\` tinyint(1) NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(`ALTER TABLE \`cp_providers\`
      ADD CONSTRAINT \`fkCPPCurrencyIso3Idx\` FOREIGN KEY (\`convertedCurrency\`) REFERENCES \`cp_currencies\` (\`iso3\`)
      ON DELETE RESTRICT ON UPDATE CASCADE`);

    await setConvertedCurrencies(queryRunner);
    await setIsPaymentAccountRequired(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await tolerateQuery(queryRunner, `ALTER TABLE \`cp_providers\` DROP FOREIGN KEY \`fkCPPCurrencyIso3Idx\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP COLUMN \`isPaymentAccountRequired\``);
    await queryRunner.query(`ALTER TABLE \`cp_providers\` DROP COLUMN \`convertedCurrency\``);
  }
}
