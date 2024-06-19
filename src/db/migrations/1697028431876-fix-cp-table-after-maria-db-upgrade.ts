import { MigrationInterface, QueryRunner } from 'typeorm';
import { tolerateQuery } from '../sql-utils/queryUtils';

export class FixCpTableAfterMariaDbUpgrade1697028431876 implements MigrationInterface {
  public name = FixCpTableAfterMariaDbUpgrade1697028431876.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // We fix the component-test errors which appeared when trying to delete the test data from the database.
    // This appears to be a MariaDb v10.2.44 bug, which is fixed when you restart the database.
    // The bug occurs when the ON DELETE is set to RESTRICT.

    // Remove the foreign keys first to avoid constraint errors when deleting rows.
    await tolerateQuery(
      queryRunner,
      `ALTER TABLE \`cp_countryAuthorityMethods\` DROP FOREIGN KEY \`fkCPMBCACountryAuthorityIdIdx\``
    );
    await tolerateQuery(queryRunner, `ALTER TABLE \`cp_fieldOptions\` DROP FOREIGN KEY \`fkPMFProviderMethodFieldId\``);
    await tolerateQuery(
      queryRunner,
      `ALTER TABLE \`cp_providerMethodFields\` DROP FOREIGN KEY \`fkPMProviderMethodId\``
    );

    // Fix the data constraint issues, that might occur when running this migration due to bug in payments-configuration-management-service.
    await queryRunner.query('DELETE FROM `cp_countryAuthorityMethods` WHERE `countryAuthorityId` IS NULL');
    await queryRunner.query('DELETE FROM `cp_fieldOptions` WHERE `providerMethodFieldId` IS NULL');
    await queryRunner.query('DELETE FROM `cp_providerMethodFields` WHERE `providerMethodId` IS NULL');
    await queryRunner.query(
      'DELETE FROM `cp_countryAuthorityMethods` WHERE `countryAuthorityId` NOT IN (SELECT `id` FROM `cp_countriesAuthorities`)'
    );
    await queryRunner.query(
      'DELETE FROM `cp_fieldOptions` WHERE `providerMethodFieldId` NOT IN (SELECT `id` FROM `cp_providerMethodFields`)'
    );
    await queryRunner.query(
      'DELETE FROM `cp_fieldOptions` WHERE `providerMethodFieldId` IN ' +
        '(SELECT cp_pmf.id FROM `cp_providerMethodFields` cp_pmf WHERE cp_pmf.providerMethodId NOT IN (SELECT cp_pm.id FROM `cp_providerMethods` cp_pm))'
    );
    await queryRunner.query(
      'DELETE FROM `cp_providerMethodFields` WHERE `providerMethodId` NOT IN (SELECT `id` FROM `cp_providerMethods`)'
    );

    // Adjust the ON DELETE to be CASCADE in order to avoid MariaDb bug.
    await queryRunner.query(`ALTER TABLE \`cp_countryAuthorityMethods\` ADD CONSTRAINT \`fkCPMBCACountryAuthorityIdIdx\`
        FOREIGN KEY (\`countryAuthorityId\`) REFERENCES \`cp_countriesAuthorities\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` ADD CONSTRAINT \`fkPMFProviderMethodFieldId\`
        FOREIGN KEY (\`providerMethodFieldId\`) REFERENCES \`cp_providerMethodFields\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD CONSTRAINT \`fkPMProviderMethodId\`
        FOREIGN KEY (\`providerMethodId\`) REFERENCES \`cp_providerMethods\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);

    // We provide default values to some fields, for component-test to pass.
    await queryRunner.query(
      `ALTER TABLE \`cp_methods\` MODIFY COLUMN createdBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_methods\` MODIFY COLUMN updatedBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providers\` MODIFY COLUMN createdBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providers\` MODIFY COLUMN updatedBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` MODIFY COLUMN createdBy varchar(100)
        CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` MODIFY COLUMN updatedBy varchar(100)
        CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY COLUMN createdBy varchar(100)
        CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` MODIFY COLUMN updatedBy varchar(100)
        CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await tolerateQuery(queryRunner, `ALTER TABLE \`cp_fieldOptions\` DROP FOREIGN KEY \`fkPMFProviderMethodFieldId\``);
    await tolerateQuery(
      queryRunner,
      `ALTER TABLE \`cp_countryAuthorityMethods\` DROP FOREIGN KEY \`fkCPMBCACountryAuthorityIdIdx\``
    );
    await tolerateQuery(
      queryRunner,
      `ALTER TABLE \`cp_providerMethodFields\` DROP FOREIGN KEY \`fkPMProviderMethodId\``
    );

    await queryRunner.query(`ALTER TABLE \`cp_fieldOptions\` ADD CONSTRAINT \`fkPMFProviderMethodFieldId\`
        FOREIGN KEY (\`providerMethodFieldId\`) REFERENCES \`cp_providerMethodFields\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE \`cp_countryAuthorityMethods\` ADD CONSTRAINT \`fkCPMBCACountryAuthorityIdIdx\`
        FOREIGN KEY (\`countryAuthorityId\`) REFERENCES \`cp_countriesAuthorities\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethodFields\` ADD CONSTRAINT \`fkPMProviderMethodId\`
        FOREIGN KEY (\`providerMethodId\`) REFERENCES \`cp_providerMethods\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);

    await queryRunner.query(
      `ALTER TABLE \`cp_methods\` MODIFY COLUMN createdBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_methods\` MODIFY COLUMN updatedBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providers\` MODIFY COLUMN createdBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providers\` MODIFY COLUMN updatedBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` MODIFY COLUMN createdBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` MODIFY COLUMN updatedBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethodFields\` MODIFY COLUMN createdBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethodFields\` MODIFY COLUMN updatedBy varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`
    );
  }
}
