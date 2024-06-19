import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyStpRules1712065030564 implements MigrationInterface {
  public name = ModifyStpRules1712065030564.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `cp_stpProviderRules` DROP CONSTRAINT fkCPSTPRuleKeyIdx');
    await queryRunner.query(`ALTER TABLE \`cp_stpProviderRules\` DROP COLUMN \`stpRuleKey\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_stpProviderRules\` ADD COLUMN \`stpRuleKey\` VARCHAR(100) NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE cp_stpProviderRules
      ADD CONSTRAINT fkCPSTPRuleKeyIdx
      FOREIGN KEY (stpRuleKey) REFERENCES cp_stpRules(\`key\`)
      ON DELETE RESTRICT ON UPDATE CASCADE;
    `);
  }
}
