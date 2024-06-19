import { CredentialsOverlapErrorCode } from '@domains/providers/errors';
import { CredentialsData } from '@domains/providers/types';
import { CountryAuthorityEntity } from '@core';

import { CredentialsValidator } from './credentials-validator';

describe('CredentialsValidator', () => {
  describe('ERR_CREDENTIALS_OVERLAP', () => {
    it('Should pass', () => {
      const data: CredentialsData[] = [
        {
          parameters: { authority: 'GM' },
          credentialsDetails: [
            { key: 'one', value: 'one' },
          ],
        },
      ];

      expect(() =>
        CredentialsValidator.validate(data, {
          countriesAuthoritiesBounded: [
            mock<CountryAuthorityEntity>({ authorityFullCode: 'GM', countryIso2: 'CY' }),
          ],
        })
      ).not.toThrow();
    });

    it('Should throw if has overlap by credentials', () => {
      const data: CredentialsData[] = [
        {
          parameters: { authority: 'GM' },
          credentialsDetails: [
            { key: 'one', value: 'one' },
            { key: 'one', value: 'two' },
          ],
        },
      ];

      expect(() => CredentialsValidator.validate(data, { countriesAuthoritiesBounded: [] })
      ).toThrow(expect.objectContaining({
        code: CredentialsOverlapErrorCode.CREDENTIALS_OVERLAP,
      }));
    });
  });

  describe('ERR_PARAMETERS_OVERLAP', () => {
    describe('positive', () => {
      it('Should pass if has different authority', () => {
        const data: CredentialsData[] = [
          {
            parameters: { authority: 'GM' },
            credentialsDetails: [],
          },
          {
            parameters: { authority: 'FSCM' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, {
            countriesAuthoritiesBounded: [
              mock<CountryAuthorityEntity>({ authorityFullCode: 'GM', countryIso2: 'CY' }),
              mock<CountryAuthorityEntity>({ authorityFullCode: 'FSCM', countryIso2: 'TT' }),
            ],
          })
        ).not.toThrow();
      });

      it('Should pass if has different countries', () => {
        const data: CredentialsData[] = [
          {
            parameters: { country: 'BR', currency: 'BRL' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'USD' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, {
            countriesAuthoritiesBounded: [
              mock<CountryAuthorityEntity>({ authorityFullCode: 'FSCM', countryIso2: 'AR' }),
              mock<CountryAuthorityEntity>({ countryIso2: 'BR' }),
            ],
          })
        ).not.toThrow();
      });

      it('Should pass if have all parameters and same currency', () => {
        const data: CredentialsData[] = [
          {
            parameters: { country: 'AR', currency: 'USD' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'BR', authority: 'GM', currency: 'USD' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, {
            countriesAuthoritiesBounded: [
              mock<CountryAuthorityEntity>({ authorityFullCode: 'GM', countryIso2: 'BR' }),
              mock<CountryAuthorityEntity>({ countryIso2: 'AR' }),
            ],
          })
        ).not.toThrow();
      });

      it('Should pass if have all parameters and different currency', () => {
        const data: CredentialsData[] = [
          {
            parameters: { country: 'BR', currency: 'BRL' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'USD' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, {
            countriesAuthoritiesBounded: [
              mock<CountryAuthorityEntity>({ authorityFullCode: 'FSCM', countryIso2: 'AR' }),
              mock<CountryAuthorityEntity>({ countryIso2: 'BR' }),
            ],
          })
        ).not.toThrow();
      });

      it('Should pass if has the same authority, overlap by country but different currency', () => {
        const data: CredentialsData[] = [
          {
            parameters: { authority: 'FSCM', currency: 'USD' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'BRL' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, {
            countriesAuthoritiesBounded: [
              mock<CountryAuthorityEntity>({ authorityFullCode: 'FSCM', countryIso2: 'AR' }),
              mock<CountryAuthorityEntity>({ countryIso2: 'FSCM' }),
            ],
          })
        ).not.toThrow();
      });

      it('Should pass if has the same currency but different authority and overlap by country', () => {
        const data: CredentialsData[] = [
          {
            parameters: { authority: 'GM', currency: 'BRL' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'BRL' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, {
            countriesAuthoritiesBounded: [
              mock<CountryAuthorityEntity>({ authorityFullCode: 'FSCM', countryIso2: 'AR' }),
              mock<CountryAuthorityEntity>({ authorityFullCode: 'GM' }),
            ],
          })
        ).not.toThrow();
      });

      it('Should pass if has different currencies but the same country authority', () => {
        const data: CredentialsData[] = [
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'USD' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'BRL' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, {
            countriesAuthoritiesBounded: [
              mock<CountryAuthorityEntity>({ authorityFullCode: 'FSCM', countryIso2: 'AR' }),
            ],
          })
        ).not.toThrow();
      });
    });

    describe('negative', () => {
      it('Should throw if has overlap by country authority', () => {
        const data: CredentialsData[] = [
          {
            parameters: { authority: 'GM', country: 'CY' },
            credentialsDetails: [],
          },
          {
            parameters: { authority: 'GM', country: 'CY' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, { countriesAuthoritiesBounded: [] })
        ).toThrow(expect.objectContaining({
          code: CredentialsOverlapErrorCode.PARAMETERS_OVERLAP,
        }));
      });

      it('Should throw if has overlap by authority', () => {
        const data: CredentialsData[] = [
          {
            parameters: { authority: 'GM' },
            credentialsDetails: [],
          },
          {
            parameters: { authority: 'GM' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, { countriesAuthoritiesBounded: [] })
        ).toThrow(expect.objectContaining({
          code: CredentialsOverlapErrorCode.PARAMETERS_OVERLAP,
        }));
      });

      it('Should throw if has overlap by all parameters', () => {
        const data: CredentialsData[] = [
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'BRL' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'BRL' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, { countriesAuthoritiesBounded: [] })
        ).toThrow(expect.objectContaining({
          code: CredentialsOverlapErrorCode.PARAMETERS_OVERLAP,
        }));
      });

      it('Should throw if has overlap by all parameters #2', () => {
        const data: CredentialsData[] = [
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'BRL' },
            credentialsDetails: [],
          },
          {
            parameters: { authority: 'FSCM', country: 'IL' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'CYSEC', currency: 'EUR' },
            credentialsDetails: [],
          },
          {
            parameters: { country: 'AR', authority: 'FSCM', currency: 'BRL' },
            credentialsDetails: [],
          },
        ];

        expect(() =>
          CredentialsValidator.validate(data, { countriesAuthoritiesBounded: [] })
        ).toThrow(expect.objectContaining({
          code: CredentialsOverlapErrorCode.PARAMETERS_OVERLAP,
        }));
      });
    });
  });
});
