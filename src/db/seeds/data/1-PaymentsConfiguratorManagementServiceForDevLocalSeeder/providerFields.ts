import { DeepPartial } from 'typeorm';

import { cp_ProviderFields } from '../../../entity/cp_ProviderFields';

export const providerFields: DeepPartial<cp_ProviderFields>[] = [
  {
    id: '1',
    providerCode: 'stripe',
    countryIso2: 'CY',
    authorityFullCode: 'CYSEC',
    currencyIso3: null,
    transactionType: 'deposit',
    fields: JSON.stringify([
      {
        key: 'paymentAccountId',
        valueType: 'string',
        defaultValue: '123456',
        pattern: '.+',
        isMandatory: true,
        isEnabled: true,
        options: [],
      },
    ]),
  },
];
