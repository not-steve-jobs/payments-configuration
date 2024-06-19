import { MigrationInterface, QueryRunner } from 'typeorm';
import { tolerateQuery } from '../sql-utils/queryUtils';

export class ChangeProviderMethodFields1699955030834 implements MigrationInterface {
  public name = 'ChangeProviderMethodFields1699955030834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // drop cp_fieldOptions index and FK, rename column `providerMethodFieldId` to `fieldId`
    await tolerateQuery(queryRunner, `ALTER TABLE \`cp_fieldOptions\` DROP FOREIGN KEY \`fkPMFProviderMethodFieldId\``);
    await tolerateQuery(queryRunner, `DROP INDEX \`CPFOUniqueFieldKey\` ON \`cp_fieldOptions\``);

    // change cp_Fields
    await tolerateQuery(
      queryRunner,
      `ALTER TABLE \`cp_providerMethodFields\` DROP FOREIGN KEY \`fkPMProviderMethodId\``
    );
    await tolerateQuery(
      queryRunner,
      `DROP INDEX \`CPPMFUniqueProviderMethodIdTypeKey\` ON \`cp_providerMethodFields\``
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethodFields\` CHANGE \`providerMethodId\` \`entityId\` varchar(36) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethodFields\` ADD \`entityType\` varchar(36) NOT NULL DEFAULT 'providerMethod'`
    );
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD \`currencyIso3\` varchar(3) NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX \`CPFUniqueEntityTransactionTypeKey\`
      ON \`cp_providerMethodFields\` (\`entityId\`, \`entityType\`, \`transactionType\`, \`key\`)`);
    await queryRunner.query(`RENAME TABLE \`cp_providerMethodFields\` TO \`cp_fields\``);

    // set cp_fieldOptions relation with cp_fields
    await queryRunner.query(
      `ALTER TABLE \`cp_fieldOptions\` CHANGE \`providerMethodFieldId\` \`fieldId\` varchar(36) NOT NULL`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX \`CPFOUniqueFieldKey\` ON \`cp_fieldOptions\` (\`fieldId\`, \`key\`)`);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\`
      ADD CONSTRAINT \`fkPMFFieldId\` FOREIGN KEY (\`fieldId\`)
        REFERENCES \`cp_fields\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop cp_fieldOptions index and FK, rename column `fieldId` to `providerMethodFieldId`
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` DROP FOREIGN KEY \`fkPMFFieldId\``);
    await queryRunner.query(`DROP INDEX \`CPFOUniqueFieldKey\` ON \`cp_fieldOptions\``);

    // revert cp_fields to cp_Fields
    await queryRunner.query(`RENAME TABLE \`cp_fields\` TO \`cp_providerMethodFields\``);
    await tolerateQuery(queryRunner, `DROP INDEX \`CPFUniqueEntityTransactionTypeKey\` ON \`cp_providerMethodFields\``);
    await tolerateQuery(queryRunner, `ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`entityType\``);
    await tolerateQuery(queryRunner, `ALTER TABLE \`cp_providerMethodFields\` DROP COLUMN \`currencyIso3\``);
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethodFields\` CHANGE \`entityId\` \`providerMethodId\` varchar(36) NOT NULL`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX \`CPPMFUniqueProviderMethodIdTypeKey\`
      ON \`cp_providerMethodFields\` (\`providerMethodId\`, \`transactionType\`, \`key\`)`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\`
      ADD CONSTRAINT \`fkPMProviderMethodId\` FOREIGN KEY (\`providerMethodId\`)
        REFERENCES \`cp_providerMethods\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);

    // set cp_fieldOptions relation with cp_Fields
    await queryRunner.query(
      `ALTER TABLE \`cp_fieldOptions\` CHANGE \`fieldId\` \`providerMethodFieldId\` varchar(36) NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPFOUniqueFieldKey\` ON \`cp_fieldOptions\` (\`providerMethodFieldId\`, \`key\`)`
    );
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\`
      ADD CONSTRAINT \`fkPMFProviderMethodFieldId\` FOREIGN KEY (\`providerMethodFieldId\`)
        REFERENCES \`cp_providerMethodFields\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
  }
}
