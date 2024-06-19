import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_CountriesAuthorities } from './cp_CountriesAuthorities';
import { cp_Methods } from './cp_Methods';

@Index('CPMBCAUniqueMethodIdCountryAuthorityId', ['methodId', 'countryAuthorityId'], { unique: true })
@Entity('cp_countryAuthorityMethods')
export class cp_CountryAuthorityMethods {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('varchar', { length: 36 })
  public methodId: string;

  @Column('varchar', { length: 36 })
  public countryAuthorityId: string;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @Column('int', { nullable: true, unsigned: true })
  public depositsOrder: number;

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

  @ManyToOne(() => cp_Methods, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn([{ name: 'methodId', referencedColumnName: 'id', foreignKeyConstraintName: 'fkCPMBCAMethodIdIdx' }])
  public method: cp_Methods;

  @ManyToOne(() => cp_CountriesAuthorities, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn([
    {
      name: 'countryAuthorityId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fkCPMBCACountryAuthorityIdIdx',
    },
  ])
  public countryAuthority: cp_CountriesAuthorities;
}
