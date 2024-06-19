import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Providers } from './cp_Providers';
import { cp_CountriesAuthorities } from './cp_CountriesAuthorities';

@Index('CPPRUniquePlatformProviderCAIdx', ['platform', 'providerCode', 'countryAuthorityId'], { unique: true })
@Entity('cp_providerRestrictions')
export class cp_ProviderRestrictions {
  @PrimaryColumn('int', { generated: 'increment' })
  public id: string;

  @Column('varchar', { length: 10 })
  public platform: string;

  @Column('varchar', { length: 100 })
  public providerCode: string;

  @Column('varchar', { length: 36, nullable: true })
  public countryAuthorityId: string;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @Column('longtext', { nullable: false })
  public settings: JSON;

  @ManyToOne(() => cp_Providers, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([{ referencedColumnName: 'code', foreignKeyConstraintName: 'fkCPPRProviderIdx' }])
  public provider: cp_Providers;

  @ManyToOne(() => cp_CountriesAuthorities, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([{ referencedColumnName: 'id', foreignKeyConstraintName: 'fkCPPRCountryAuthorityIdx' }])
  public countryAuthority: cp_CountriesAuthorities;
}
