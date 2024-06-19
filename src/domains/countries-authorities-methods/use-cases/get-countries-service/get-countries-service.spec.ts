import { CountryRepository } from '@infra';
import {
  armenia,
  countryWithAuthorityFullCodeList,
  cysecAuthority,
  fscmAuthority,
  gmAuthority,
  singapore,
  ukAuthority,
} from '@test/fixtures';
import {
  GetCountriesService,
  GetCountriesServiceOptions,
  GetCountriesServiceParams,
  GetCountriesServiceResponse,
} from '@domains/countries-authorities-methods';

describe('GetCountriesService', () => {
  it('Should return list of countries with theirs authorities filtered by authority', async () => {
    const payload: GetCountriesServiceParams = { authority: 'FSCM' };
    const expResult: GetCountriesServiceResponse = {
      countries: [
        {
          countryGroup: singapore.group,
          countryData: {
            countryCode: singapore.iso2,
            countryName: singapore.name,
            authorities: [fscmAuthority.fullCode, gmAuthority.fullCode],
          },
        },
        {
          countryGroup: armenia.group,
          countryData: {
            countryCode: armenia.iso2,
            countryName: armenia.name,
            authorities: [fscmAuthority.fullCode, gmAuthority.fullCode, cysecAuthority.fullCode],
          },
        },
      ],
    };
    const dependencies: GetCountriesServiceOptions = {
      countryRepository: mock<CountryRepository>({ getCountriesWithAuthorities: jest.fn().mockReturnValue(countryWithAuthorityFullCodeList) }),
    };

    const service = new GetCountriesService(dependencies);
    const countries = await service.execute(payload);

    expect(dependencies.countryRepository.getCountriesWithAuthorities).toBeCalledOnceWith({ authorityFullCode: payload.authority });
    expect(countries).toStrictEqual(expResult);
  });

  it('Should return empty countries list when authority has no countries', async () => {
    const payload: GetCountriesServiceParams = { authority: 'FCA' };
    const dependencies: GetCountriesServiceOptions = {
      countryRepository: mock<CountryRepository>({ getCountriesWithAuthorities: jest.fn().mockReturnValue([]) }),
    };

    const service = new GetCountriesService(dependencies);
    const { countries } = await service.execute(payload);

    expect(dependencies.countryRepository.getCountriesWithAuthorities).toBeCalledOnceWith({ authorityFullCode: ukAuthority.fullCode });
    expect(countries).toStrictEqual([]);
  });
});
