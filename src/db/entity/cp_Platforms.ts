import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index('CPPUniquePlatformNameVersion', ['name', 'version'], { unique: true })
@Entity('cp_platforms')
export class cp_Platforms {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('varchar', { length: 10 })
  public name: string;

  @Column('varchar', { length: 30 })
  public version: string;

  @Column('timestamp', { nullable: true })
  public date: Date;
}
