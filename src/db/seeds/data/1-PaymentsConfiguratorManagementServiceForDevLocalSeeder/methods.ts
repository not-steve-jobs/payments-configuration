import { DeepPartial } from 'typeorm';

import { cp_Methods } from '../../../entity';

export const methods: DeepPartial<cp_Methods>[] = [
  {
    id: '4296035f-b71b-4db0-923f-d59383169ede',
    name: 'Visa/Mastercard',
    code: 'cards',
    description: 'Card payments',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'seeds',
    updatedBy: 'seeds',
  },
];
