import { MigrationInterface, QueryRunner } from 'typeorm';

async function changeCpProvidersCodeLength(queryRunner: QueryRunner, length: number): Promise<void> {
  await queryRunner.query(`ALTER TABLE cp_credentials DROP FOREIGN KEY fkCPCProviderCodeIdx;`);
  await queryRunner.query(`ALTER TABLE \`cp_providers\` MODIFY COLUMN \`code\` varchar(${length}) NOT NULL;`);
  await queryRunner.query(`ALTER TABLE \`cp_credentials\` MODIFY COLUMN \`providerCode\` varchar(${length}) NOT NULL;`);
  await queryRunner.query(
    `ALTER TABLE cp_credentials ADD CONSTRAINT fkCPCProviderCodeIdx FOREIGN KEY (providerCode) REFERENCES cp_providers(code) ON DELETE RESTRICT ON UPDATE CASCADE;`
  );
}

export class IncreaseProviderCodeLength1702039096546 implements MigrationInterface {
  public readonly name = IncreaseProviderCodeLength1702039096546.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await changeCpProvidersCodeLength(queryRunner, 100);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await changeCpProvidersCodeLength(queryRunner, 50);
  }
}
