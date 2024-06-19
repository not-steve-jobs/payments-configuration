import { randomUUID } from 'crypto';

import { CountryAuthorityEntity } from '@core';

import { CountryAuthorityMapper } from './country-authority-mapper';

describe('CountryAuthorityMapper', () => {
  it('Should map to DTO', () => {
    const countryAuthorityEntity = mock<CountryAuthorityEntity>({
      id: randomUUID(),
      countryIso2: 'CY',
      authorityFullCode: 'CYSEC',
    });

    expect(CountryAuthorityMapper.mapToDto(countryAuthorityEntity)).toStrictEqual({
      country: countryAuthorityEntity.countryIso2,
      authority: countryAuthorityEntity.authorityFullCode,
    });
  });
});
