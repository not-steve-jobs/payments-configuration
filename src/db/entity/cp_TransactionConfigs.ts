import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_ProviderMethods } from './cp_ProviderMethods';
import { cp_Currencies } from './cp_Currencies';

@Index('CPPMTCUniqueProviderMethodIdCurrencyIso3TypeIdx', ['providerMethodId', 'currencyIso3', 'type'], {
  unique: true,
})
@Entity('cp_transactionConfigs')
export class cp_TransactionConfigs {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('varchar', { length: 36 })
  public providerMethodId: string;

  @Column('varchar', { length: 3 })
  public currencyIso3: string;

  @Column('varchar', { length: 20 })
  public type: string;

  @Column('int', { nullable: true })
  public order: number | null;

  @Column('decimal', { nullable: true, unsigned: true, precision: 20, scale: 4 })
  public minAmount: string | null;

  @Column('decimal', { nullable: true, unsigned: true, precision: 20, scale: 4 })
  public maxAmount: string | null;

  @Column('int', { nullable: true, unsigned: true, width: 4 })
  public period: number | null;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @Column('timestamp', { default: () => "'current_timestamp(3)'", precision: 3 })
  public createdAt: Date;

  @Column('timestamp', {
    default: () => "'current_timestamp(3)'",
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    precision: 3,
  })
  public updatedAt: Date;

  @Column('varchar', { length: 100 })
  public createdBy: string;

  @Column('varchar', { length: 100 })
  public updatedBy: string;

  @ManyToOne(() => cp_ProviderMethods, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    { name: 'providerMethodId', referencedColumnName: 'id', foreignKeyConstraintName: 'fkCPPMTCProviderMethodIdx' },
  ])
  public providerMethod: cp_ProviderMethods;

  @ManyToOne(() => cp_Currencies, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    { name: 'currencyIso3', referencedColumnName: 'iso3', foreignKeyConstraintName: 'fkCPPMTCCurrencyIso3Idx' },
  ])
  public currency: cp_Currencies;
}
