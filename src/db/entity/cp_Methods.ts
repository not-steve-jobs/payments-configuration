import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cp_methods')
export class cp_Methods {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('varchar', { length: 50 })
  public code: string;

  @Column('varchar', { length: 100 })
  public name: string;

  @Column('text', {})
  public description: string;

  @Column('timestamp', { default: () => "'current_timestamp(3)'", precision: 3 })
  public createdAt: Date;

  @Column('timestamp', { default: () => "'current_timestamp(3)'", onUpdate: 'CURRENT_TIMESTAMP(3)', precision: 3 })
  public updatedAt: Date;

  @Column('varchar', {
    length: 100,
    default: () => "''",
  })
  public createdBy: string;

  @Column('varchar', {
    length: 100,
    default: () => "''",
  })
  public updatedBy: string;
}
