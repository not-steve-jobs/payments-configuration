import { DeepPartial } from 'typeorm';

import { cp_Authorities } from '../../../entity';

export const authorities: DeepPartial<cp_Authorities>[] = [
  { fullCode: 'AU', name: 'AUSTRALIA' },
  { fullCode: 'CRI', name: 'Costa Rica' },
  { fullCode: 'CYSEC', name: 'CYPRUS' },
  { fullCode: 'FCA', name: 'UNITED KINGDOM' },
  { fullCode: 'FSCM', name: 'Mauritius' },
  { fullCode: 'GM', name: 'Global Markets' },
  { fullCode: 'KNN', name: 'Saint Kitts and Nevis' },
  { fullCode: 'LCA', name: 'Santa Lucia' },
  { fullCode: 'MENA', name: 'DUBAI' },
];
