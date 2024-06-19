import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { cp_Fields } from './cp_Fields';

@Index('CPFOUniqueFieldKey', ['fieldId', 'key'], { unique: true })
@Entity('cp_fieldOptions')
export class cp_FieldOptions {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('varchar', { length: 36 })
  public fieldId: string;

  @Column('varchar', { length: 255 })
  public key: string;

  @Column('varchar', { length: 255 })
  public value: string;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @ManyToOne(() => cp_Fields, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn([{ name: 'fieldId', referencedColumnName: 'id', foreignKeyConstraintName: 'fkPMFFieldId' }])
  public field: cp_Fields;
}
