import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Providers } from './cp_Providers';
import { cp_Authorities } from './cp_Authorities';
import { cp_Currencies } from './cp_Currencies';
import { cp_Countries } from './cp_Countries';

@Entity('cp_bankAccounts')
export class cp_BankAccounts {
  @PrimaryColumn('int', { generated: 'increment' })
  public id: string;

  @Column('varchar', { length: 100 })
  public name: string;

  @Column('varchar', { length: 50 })
  public type: string;

  @Column('varchar', { length: 100 })
  public providerCode: string;

  @Column('varchar', { length: 20 })
  public authorityFullCode: string;

  @Column('varchar', { nullable: true, length: 2 })
  public countryIso2: string | null;

  @Column('varchar', { length: 3 })
  public currencyIso3: string;

  @Column('longtext')
  public configs: string;

  @ManyToOne(() => cp_Providers, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    { name: 'providerCode', referencedColumnName: 'code', foreignKeyConstraintName: 'fkCPBAProviderCodeIdx' },
  ])
  public provider: cp_Providers;

  @ManyToOne(() => cp_Authorities, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    {
      name: 'authorityFullCode',
      referencedColumnName: 'fullCode',
      foreignKeyConstraintName: 'fkCPBAAuthorityFullCodeIdx',
    },
  ])
  public authority: cp_Authorities;

  @ManyToOne(() => cp_Countries, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([{ name: 'countryIso2', referencedColumnName: 'iso2', foreignKeyConstraintName: 'fkCPBACountryIso2Idx' }])
  public country: cp_Countries;

  @ManyToOne(() => cp_Currencies, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    { name: 'currencyIso3', referencedColumnName: 'iso3', foreignKeyConstraintName: 'fkCPBACurrencyIso3Idx' },
  ])
  public currency: cp_Currencies;
}
