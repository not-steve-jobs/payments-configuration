import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Authorities } from './cp_Authorities';
import { cp_Countries } from './cp_Countries';

@Index('CPCAUniqueIso2FullCode', ['countryIso2', 'authorityFullCode'], { unique: true })
@Entity('cp_countriesAuthorities')
export class cp_CountriesAuthorities {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('int', { nullable: true })
  public adminApiId: number | null;

  @Column('varchar', { length: 20 })
  public authorityFullCode: string;

  @Column('varchar', { length: 2 })
  public countryIso2: string;

  @ManyToOne(() => cp_Authorities, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([
    {
      name: 'authorityFullCode',
      referencedColumnName: 'fullCode',
      foreignKeyConstraintName: 'fkCPCAAuthorityFullCodeIdx',
    },
  ])
  public authority: cp_Authorities;

  @ManyToOne(() => cp_Countries, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([{ name: 'countryIso2', referencedColumnName: 'iso2', foreignKeyConstraintName: 'fkCPCACountryIso2Idx' }])
  public country: cp_Countries;
}
