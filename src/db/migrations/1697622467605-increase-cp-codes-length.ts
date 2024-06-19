import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseCPCodesLength1697622467605 implements MigrationInterface {
  public readonly name = IncreaseCPCodesLength1697622467605.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_providers\` MODIFY \`code\` varchar(50) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_methods\` MODIFY \`code\` varchar(50) NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cp_methods\` MODIFY \`code\` varchar(20) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`cp_providers\` MODIFY \`code\` varchar(20) NOT NULL`);
  }
}
