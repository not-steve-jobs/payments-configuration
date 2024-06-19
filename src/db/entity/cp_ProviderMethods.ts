import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_CountryAuthorityMethods } from './cp_CountryAuthorityMethods';
import { cp_Providers } from './cp_Providers';

@Index('CPPMUniqueProviderIdCountryAuthorityMethodId', ['providerId', 'countryAuthorityMethodId'], { unique: true })
@Entity('cp_providerMethods')
export class cp_ProviderMethods {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('varchar', { length: 36 })
  public countryAuthorityMethodId: string;

  @Column('varchar', { length: 36 })
  public providerId: string;

  @Column('varchar', { nullable: true, length: 36 })
  public credentialsId: string | null;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @Column('tinyint', { default: 0, width: 1 })
  public isPayoutAsRefund: boolean;

  @Column('tinyint', { default: 0, width: 1 })
  public isPaymentAccountRequired: boolean;

  @Column('int', { nullable: false, default: 1 })
  public refundsOrder: number;

  @Column('int', { nullable: false, default: 1 })
  public payoutsOrder: number;

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

  @ManyToOne(() => cp_CountryAuthorityMethods, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    {
      name: 'countryAuthorityMethodId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fkCPPMCountryAuthorityMethodId',
    },
  ])
  public countryAuthorityMethod: cp_CountryAuthorityMethods;

  @ManyToOne(() => cp_Providers, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([{ name: 'providerId', referencedColumnName: 'id', foreignKeyConstraintName: 'fkCPPMProviderIdIdx' }])
  public provider: cp_Providers;
}
