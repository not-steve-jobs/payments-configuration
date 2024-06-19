import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index('CPAUniqueFullCode', ['fullCode'], { unique: true })
@Entity('cp_authorities')
export class cp_Authorities {
  @PrimaryColumn('varchar', { length: 20, unique: true })
  public fullCode: string;

  @Column('varchar', { length: 100 })
  public name: string;
}
