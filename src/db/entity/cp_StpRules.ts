import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index('cpStpRules_key_unique', ['key'], { unique: true })
@Entity('cp_stpRules')
export class cp_StpRules {
  @PrimaryColumn('int', { generated: 'increment' })
  public id: string;

  @Column('varchar', { length: 100 })
  public key: string;

  @Column('text', { nullable: true })
  public description: string | null;

  @Column('integer', { nullable: false })
  public order: number;

  @Column('longtext', { nullable: true })
  public data: string | null;

  @Column('timestamp', { default: () => "'current_timestamp(3)'", precision: 3 })
  public createdAt: Date;

  @Column('timestamp', {
    default: () => "'current_timestamp(3)'",
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    precision: 3,
  })
  public updatedAt: Date;
}
