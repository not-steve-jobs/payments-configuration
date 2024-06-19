import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Providers } from './cp_Providers';
import { cp_Authorities } from './cp_Authorities';
import { cp_Countries } from './cp_Countries';
import { cp_Currencies } from './cp_Currencies';

@Index(
  'CPPFUniqueProviderCountryAuthorityCurrencyIdx',
  ['providerCode', 'countryIso2', 'authorityFullCode', 'currencyIso3'],
  { unique: true }
)
@Entity('cp_providerFields')
export class cp_ProviderFields {
  @PrimaryColumn('int', { generated: 'increment' })
  public id: string;

  @Column('varchar', { length: 100, nullable: false })
  public providerCode: string;

  @Column('varchar', { length: 2, nullable: true })
  public countryIso2: string | null;

  @Column('varchar', { length: 20, nullable: true })
  public authorityFullCode: string | null;

  @Column('varchar', { length: 3, nullable: true })
  public currencyIso3: string | null;

  @Column('varchar', { length: 20, nullable: false })
  public transactionType: string;

  @Column('longtext')
  public fields: string;

  @ManyToOne(() => cp_Providers, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    { name: 'providerCode', referencedColumnName: 'code', foreignKeyConstraintName: 'fkCPPFProviderCodeIdx' },
  ])
  public provider: cp_Providers;

  @ManyToOne(() => cp_Authorities, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    {
      name: 'authorityFullCode',
      referencedColumnName: 'fullCode',
      foreignKeyConstraintName: 'fkCPPFAuthorityFullCodeIdx',
    },
  ])
  public authority: cp_Authorities;

  @ManyToOne(() => cp_Countries, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([{ name: 'countryIso2', referencedColumnName: 'iso2', foreignKeyConstraintName: 'fkCPPFCountryIso2Idx' }])
  public country: cp_Countries;

  @ManyToOne(() => cp_Currencies, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    { name: 'currencyIso3', referencedColumnName: 'iso3', foreignKeyConstraintName: 'fkCPPFCurrencyIso3Idx' },
  ])
  public currency: cp_Currencies;
}
