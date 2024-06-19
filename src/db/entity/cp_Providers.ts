import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Currencies } from './cp_Currencies';

@Index('CPPUniqueName', ['name'], { unique: true })
@Index('IDX-CP_PROVIDERS-CODE', ['code'], { unique: true })
@Entity('cp_providers')
export class cp_Providers {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @Column('int', { nullable: true })
  public adminApiId: number;

  @Column('varchar', { length: 100 })
  public name: string;

  @Column('varchar', { length: 100 })
  public code: string;

  @Column('text', { nullable: true })
  public description: string | null;

  @Column('varchar', { nullable: true, length: 3 })
  public convertedCurrency: string | null;

  @Column('tinyint', { nullable: false, default: 0, width: 1 })
  public isCrypto: boolean;

  @Column('tinyint', { nullable: false, default: 0, width: 1 })
  public maintenance: boolean;

  @Column('varchar', { length: 20, default: 'default' })
  public type: string;

  @Column('timestamp', { default: () => "'current_timestamp(3)'", precision: 3 })
  public createdAt: Date;

  @Column('timestamp', {
    default: () => "'current_timestamp(3)'",
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    precision: 3,
  })
  public updatedAt: Date;

  @Column('varchar', {
    length: 100,
    default: () => "''",
  })
  public createdBy: string;

  @Column('varchar', {
    length: 100,
    default: () => "''",
  })
  public updatedBy: string;

  @ManyToOne(() => cp_Currencies, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    { name: 'convertedCurrency', referencedColumnName: 'iso3', foreignKeyConstraintName: 'fkCPPCurrencyIso3Idx' },
  ])
  public currency: cp_Currencies;
}
