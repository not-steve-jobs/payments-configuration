import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProviderMethodsFK1694172727226 implements MigrationInterface {
  public name = 'RenameProviderMethodsFK1694172727226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP FOREIGN KEY \`fkCPPMMethodByCountryAuthorityId\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP FOREIGN KEY \`fkCPPMProviderIdIdIdx\``);
    await queryRunner.query(`DROP INDEX \`CPPMUniqueProviderIdMethodByCountryAuthorityId\` ON \`cp_providerMethods\``);
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` CHANGE \`methodByCountryAuthorityId\` \`countryAuthorityMethodId\` varchar(36) NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPPMUniqueProviderIdCountryAuthorityMethodId\` ON \`cp_providerMethods\` (\`providerId\`, \`countryAuthorityMethodId\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD CONSTRAINT \`fkCPPMCountryAuthorityMethodId\` FOREIGN KEY (\`countryAuthorityMethodId\`) REFERENCES \`cp_countryAuthorityMethods\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD CONSTRAINT \`fkCPPMProviderIdIdx\` FOREIGN KEY (\`providerId\`) REFERENCES \`cp_providers\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP FOREIGN KEY \`fkCPPMProviderIdIdx\``);
    await queryRunner.query(`ALTER TABLE \`cp_providerMethods\` DROP FOREIGN KEY \`fkCPPMCountryAuthorityMethodId\``);
    await queryRunner.query(`DROP INDEX \`CPPMUniqueProviderIdCountryAuthorityMethodId\` ON \`cp_providerMethods\``);
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` CHANGE \`countryAuthorityMethodId\` \`methodByCountryAuthorityId\` varchar(36) NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`CPPMUniqueProviderIdMethodByCountryAuthorityId\` ON \`cp_providerMethods\` (\`providerId\`, \`methodByCountryAuthorityId\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD CONSTRAINT \`fkCPPMProviderIdIdIdx\` FOREIGN KEY (\`providerId\`) REFERENCES \`cp_providers\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`cp_providerMethods\` ADD CONSTRAINT \`fkCPPMMethodByCountryAuthorityId\` FOREIGN KEY (\`methodByCountryAuthorityId\`) REFERENCES \`cp_countryAuthorityMethods\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
  }
}
