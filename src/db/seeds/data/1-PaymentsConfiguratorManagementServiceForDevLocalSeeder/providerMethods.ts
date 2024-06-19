import { DeepPartial } from 'typeorm';

import { cp_ProviderMethods } from '../../../entity';

export const providerMethods: DeepPartial<cp_ProviderMethods>[] = [
  {
    id: '2b2abdee-3e6d-4d85-85ac-97b2e2e72983',
    countryAuthorityMethodId: '077af3b4-8036-4efa-9f94-2c493826bdca',
    providerId: '74d92b23-9a44-42d3-a560-f813a46db39f',
    isEnabled: true,
    isPayoutAsRefund: false,
    isPaymentAccountRequired: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'seeds',
    updatedBy: 'seeds',
  },
];
