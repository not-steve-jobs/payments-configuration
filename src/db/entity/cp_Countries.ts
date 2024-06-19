import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index('CPCUniqueIso2', ['iso2'], { unique: true })
@Index('CPCUniqueIso3', ['iso3'], { unique: true })
@Index('CPCUniqueName', ['name'], { unique: true })
@Entity('cp_countries')
export class cp_Countries {
  @PrimaryColumn('varchar', { length: 2 })
  public iso2: string;

  @Column('int', { nullable: true })
  public adminApiId: number;

  @Column('varchar', { length: 3 })
  public iso3: string;

  @Column('varchar', { length: 60 })
  public name: string;

  @Column('varchar', { length: 30, nullable: true })
  public group: string;
}
