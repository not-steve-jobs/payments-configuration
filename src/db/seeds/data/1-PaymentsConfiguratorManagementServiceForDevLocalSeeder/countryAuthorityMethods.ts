import { DeepPartial } from 'typeorm';

import { cp_CountryAuthorityMethods } from '../../../entity';

export const countryAuthorityMethods: DeepPartial<cp_CountryAuthorityMethods>[] = [
  {
    id: '077af3b4-8036-4efa-9f94-2c493826bdca',
    methodId: '4296035f-b71b-4db0-923f-d59383169ede',
    countryAuthorityId: '1444981a-84ce-4383-929d-b0695258981a',
    isEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'seeds',
    updatedBy: 'seeds',
  },
];
