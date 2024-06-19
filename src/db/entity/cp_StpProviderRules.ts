import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Authorities } from './cp_Authorities';
import { cp_Countries } from './cp_Countries';
import { cp_Providers } from './cp_Providers';

@Entity('cp_stpProviderRules')
export class cp_StpProviderRules {
  @PrimaryColumn('int', { generated: 'increment' })
  public id: string;

  @Column('varchar', { length: 100 })
  public providerCode: string;

  @Column('varchar', { length: 20 })
  public authorityFullCode: string;

  @Column('varchar', { nullable: true, length: 2 })
  public countryIso2: string | null;

  @Column('longtext', { nullable: true })
  public data: string | null;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @ManyToOne(() => cp_Providers, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    { name: 'providerCode', referencedColumnName: 'code', foreignKeyConstraintName: 'fkCPSTPRuleProviderCodeIdx' },
  ])
  public provider: cp_Providers;

  @ManyToOne(() => cp_Authorities, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    {
      name: 'authorityFullCode',
      referencedColumnName: 'fullCode',
      foreignKeyConstraintName: 'fkCPSTPRuleAuthorityFullCodeIdx',
    },
  ])
  public authority: cp_Authorities;

  @ManyToOne(() => cp_Countries, { onDelete: 'RESTRICT', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn([
    { name: 'countryIso2', referencedColumnName: 'iso2', foreignKeyConstraintName: 'fkCPSTPRuleCountryIso2Idx' },
  ])
  public country: cp_Countries;
}
