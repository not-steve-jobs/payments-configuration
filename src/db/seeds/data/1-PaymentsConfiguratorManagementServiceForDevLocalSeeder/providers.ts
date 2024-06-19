import { DeepPartial } from 'typeorm';

import { cp_Providers } from '../../../entity';

export const providers: DeepPartial<cp_Providers>[] = [
  {
    id: '74d92b23-9a44-42d3-a560-f813a46db39f',
    adminApiId: 3,
    name: 'Stripe',
    code: 'stripe',
    description: null,
    convertedCurrency: null,
    isCrypto: false,

    maintenance: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'seeds',
    updatedBy: 'seeds',
  },
];
