import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeInConfiguratorIsCryptoDefaultValue1690871300557 implements MigrationInterface {
  public name = 'changeInConfiguratorIsCryptoDefaultValue1690871300557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cp_providers\` CHANGE \`isCrypto\` \`isCrypto\` tinyint(1) NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cp_providers\` CHANGE \`isCrypto\` \`isCrypto\` tinyint(1) NOT NULL DEFAULT '1'`
    );
  }
}
