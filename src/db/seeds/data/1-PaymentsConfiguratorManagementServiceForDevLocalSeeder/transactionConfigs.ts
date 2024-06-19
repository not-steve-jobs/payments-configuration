import { DeepPartial } from 'typeorm';

import { cp_TransactionConfigs } from '../../../entity';

enum TransactionTypesEnum {
  DEPOSIT = 'deposit',
  REFUND = 'refund',
  PAYOUT = 'payout',
}

export const transactionConfigs: DeepPartial<cp_TransactionConfigs>[] = [
  {
    id: 'd0f64f62-fb16-4972-a5e5-9b74b73a5b00',
    currencyIso3: 'EUR',
    providerMethodId: '2b2abdee-3e6d-4d85-85ac-97b2e2e72983',
    type: TransactionTypesEnum.DEPOSIT,
    minAmount: '80.0000',
    maxAmount: '850.0000',
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'seeds',
    updatedBy: 'seeds',
  },
  {
    id: 'ee5f501e-74c9-4e51-b692-77981ab76edd',
    currencyIso3: 'EUR',
    providerMethodId: '2b2abdee-3e6d-4d85-85ac-97b2e2e72983',
    type: TransactionTypesEnum.PAYOUT,
    minAmount: '75.0000',
    maxAmount: '9000.0000',
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'seeds',
    updatedBy: 'seeds',
  },
  {
    id: '085b505e-811c-47d6-afca-9cabf5112a70',
    currencyIso3: 'EUR',
    providerMethodId: '2b2abdee-3e6d-4d85-85ac-97b2e2e72983',
    type: TransactionTypesEnum.REFUND,
    minAmount: '75.0000',
    period: 1,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'seeds',
    updatedBy: 'seeds',
  },
];
