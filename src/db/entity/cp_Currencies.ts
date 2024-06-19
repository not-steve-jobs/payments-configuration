import { Entity, PrimaryColumn } from 'typeorm';

@Entity('cp_currencies')
export class cp_Currencies {
  @PrimaryColumn('varchar', { length: 3, unique: true })
  public iso3: string;
}
