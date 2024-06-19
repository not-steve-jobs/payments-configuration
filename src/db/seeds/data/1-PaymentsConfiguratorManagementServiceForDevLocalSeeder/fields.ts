import { DeepPartial } from 'typeorm';

import { cp_Fields } from '../../../entity';

export const fields: DeepPartial<cp_Fields>[] = [
  {
    id: '44321b9d-4d22-4a41-9003-00ced416ee5f',
    entityId: 'af130be1-1656-4040-b9f8-a644a8fa718d',
    entityType: 'providerMethod',
    transactionType: 'deposit',
    adminApiId: 2583,
    key: 'paymentAccountId',
    valueType: 'string',
    value: 'Payment account ID',
    pattern: '.+',
    currencyIso3: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'Migration',
    updatedBy: 'Migration',
  },
];
