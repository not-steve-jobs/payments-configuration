import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index(
  'CPFUniqueEntityTransactionTypeKeyCurrencyIso3',
  ['entityId', 'entityType', 'transactionType', 'key', 'currencyIso3'],
  { unique: true }
)
@Entity('cp_fields')
export class cp_Fields {
  @PrimaryColumn('varchar', { length: 36, unique: true })
  public id: string;

  @Column('int', { nullable: true })
  public adminApiId: number | null;

  @Column('varchar', { length: 36 })
  public entityId: string;

  @Column('varchar', { length: 36, default: 'providerMethod' })
  public entityType: string;

  @Column('varchar', { length: 3, nullable: false, default: '' })
  public currencyIso3: string;

  @Column('varchar', { length: 20 })
  public transactionType: string;

  @Column('varchar', { length: 255 })
  public key: string;

  @Column('varchar', { length: 255 })
  public valueType: string;

  @Column('varchar', { length: 255, nullable: true })
  public value: string;

  @Column('varchar', { length: 255, nullable: true })
  public defaultValue: string;

  @Column('varchar', { length: 700, nullable: false })
  public pattern: string;

  @Column('tinyint', { default: 1, width: 1 })
  public isMandatory: boolean;

  @Column('tinyint', { default: 1, width: 1 })
  public isEnabled: boolean;

  @Column('timestamp', { default: () => "'current_timestamp(3)'", precision: 3 })
  public createdAt: Date;

  @Column('timestamp', {
    default: () => "'current_timestamp(3)'",
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    precision: 3,
  })
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
