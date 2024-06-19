import { randomUUID } from 'crypto';

import { CountryEntity } from '@core';

import { CountryMapper } from './country-mapper';

describe('CountryMapper', () => {
  it('Should map to DTO', () => {
    const countryEntity = mock<CountryEntity>({
      id: randomUUID(),
      iso2: 'CY',
      iso3: 'CYSEC',
      name: 'example country',
      group: 'example group',
    });

    expect(CountryMapper.mapToDto(countryEntity)).toStrictEqual({
      group: countryEntity.group,
      iso2: countryEntity.iso2,
      iso3: countryEntity.iso3,
      name: countryEntity.name,
    });
  });
});
