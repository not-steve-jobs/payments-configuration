import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Providers } from './cp_Providers';
import { cp_Authorities } from './cp_Authorities';
import { cp_Countries } from './cp_Countries';
import { cp_Currencies } from './cp_Currencies';

@Index(
  'CPСUniqueProviderAuthorityCountryCurrencyIdx',
  ['providerCode', 'authorityFullCode', 'countryIso2', 'currencyIso3'],
  { unique: true }
)
@Entity('cp_credentials')
export class cp_Credentials {
  @PrimaryColumn('int', { generated: 'increment' })
  public id: string;

  @Column('varchar', { length: 100 })
  public providerCode: string;

  @Column('varchar', { nullable: true, length: 20 })
  public authorityFullCode: string | null;

  @Column('varchar', { nullable: true, length: 2 })
  public countryIso2: string | null;

  @Column('varchar', { nullable: true, length: 3 })
  public currencyIso3: string | null;

  @Column('longtext')
  public credentialsDetails: string;

  @ManyToOne(() => cp_Providers, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    { name: 'providerCode', referencedColumnName: 'code', foreignKeyConstraintName: 'fkCPCProviderCodeIdx' },
  ])
  public provider: cp_Providers;

  @ManyToOne(() => cp_Authorities, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    {
      name: 'authorityFullCode',
      referencedColumnName: 'fullCode',
      foreignKeyConstraintName: 'fkCPCAuthorityFullCodeIdx',
    },
  ])
  public authority: cp_Authorities;

  @ManyToOne(() => cp_Countries, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([{ name: 'countryIso2', referencedColumnName: 'iso2', foreignKeyConstraintName: 'fkCPCCountryIso2Idx' }])
  public country: cp_Countries;

  @ManyToOne(() => cp_Currencies, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    { name: 'currencyIso3', referencedColumnName: 'iso3', foreignKeyConstraintName: 'fkCPCCurrencyIso3Idx' },
  ])
  public currency: cp_Currencies;
}
