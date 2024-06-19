import { CredentialDetails, CredentialsData, CredentialsGroupedData } from '@domains/providers/types';

import { CredentialsDataGroupMapper } from './credentials-data-group-mapper';

describe('CredentialsDataGroupMapper', () => {
  describe('#credentialDataListToGroup', () => {
    it('Should return details with shared parameters', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsData[] = [{ parameters: {}, credentialsDetails }];

      expect(CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData)).toStrictEqual([
        { parameters: {}, credentialsDetails } as CredentialsGroupedData,
      ]);
    });

    it('Should merge parameters with the same currencies', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsData[] = [
        { parameters: { authority: 'CYSEC', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'FSCM', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'FSCM', currency: 'EUR' }, credentialsDetails },
      ];

      expect(CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData)).toStrictEqual([
        {
          parameters: {
            currencies: ['USD', 'EUR'],
            countryAuthorities: [
              { authority: 'CYSEC' },
              { authority: 'FSCM' },
            ],
          },
          credentialsDetails,
        } as CredentialsGroupedData,
      ]);
    });

    it('Should group into two different groups with the same authority', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsData[] = [
        { parameters: { authority: 'GM', country: 'CY' }, credentialsDetails },
        { parameters: { authority: 'GM', country: 'CY', currency: 'USD' }, credentialsDetails },
      ];

      expect(CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData)).toStrictEqual( [
        {
          parameters: {
            currencies: [],
            countryAuthorities: [
              { authority: 'GM', country: 'CY' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: {
            currencies: ['USD'],
            countryAuthorities: [
              { authority: 'GM', country: 'CY' },
            ],
          },
          credentialsDetails,
        },
      ]);
    });

    it('Should group without currencies', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsData[] = [
        { parameters: {}, credentialsDetails },
        { parameters: { authority: 'CYSEC' }, credentialsDetails },
        { parameters: { authority: 'GM', country: 'CY' }, credentialsDetails },
        { parameters: { country: 'IL' }, credentialsDetails },
        { parameters: { country: 'CY' }, credentialsDetails },
        { parameters: { country: 'KNN' }, credentialsDetails },
        { parameters: { country: 'HK' }, credentialsDetails },
        { parameters: { authority: 'GM' }, credentialsDetails },
        { parameters: { authority: 'GM', country: 'CY', currency: 'USD' }, credentialsDetails },
        { parameters: { currency: 'EUR' }, credentialsDetails },
      ];

      expect(CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData)).toStrictEqual([
        {
          parameters: {},
          credentialsDetails,
        },
        {
          parameters: {
            currencies: [],
            countryAuthorities: [
              { authority: 'CYSEC' },
              { authority: 'GM', country: 'CY' },
              { country: 'IL' },
              { country: 'CY' },
              { country: 'KNN' },
              { country: 'HK' },
              { authority: 'GM' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: {
            currencies: ['USD'],
            countryAuthorities: [
              { authority: 'GM', country: 'CY' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: {
            currencies: ['EUR'],
            countryAuthorities: [{}],
          },
          credentialsDetails,
        },
      ]);
    });

    it('Should merge parameters to different groups', () => {
      const credentialsFSCM: CredentialDetails[] = [
        { key: 'organisationId', value: '14236' },
        { key: 'salt', value: '6b5l02CcVUUMGh4qnxcZW_U_' },
      ];
      const credentialsGMKNN: CredentialDetails[] = [
        { key: 'organisationId', value: '14131' },
        { key: 'salt', value: 'k3b7OxcTzcKHywGLu-sL89Z' },
      ];
      const credentialsData: CredentialsData[] = [
        { parameters: { authority: 'FSCM', currency: 'ZAR' }, credentialsDetails: credentialsFSCM },
        { parameters: { authority: 'GM', currency: 'ZAR' }, credentialsDetails: credentialsGMKNN },
        { parameters: { authority: 'KNN', currency: 'ZAR' }, credentialsDetails: credentialsGMKNN },
      ];

      expect(CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData)).toStrictEqual([
        {
          parameters: {
            currencies: ['ZAR'],
            countryAuthorities: [
              { authority: 'FSCM' },
            ],
          },
          credentialsDetails: credentialsFSCM,
        } as CredentialsGroupedData,
        {
          parameters: {
            currencies: ['ZAR'],
            countryAuthorities: [
              { authority: 'GM' },
              { authority: 'KNN' },
            ],
          },
          credentialsDetails: credentialsGMKNN,
        } as CredentialsGroupedData,
      ]);
    });

    it('Should merge parameters with the same currencies with different payload', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsData[] = [
        { parameters: { authority: 'CYSEC', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', country: 'CY', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', country: 'CY', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'GR', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'GR', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'SP', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'SP', currency: 'USD' }, credentialsDetails },
      ];

      expect(CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData)).toStrictEqual([
        {
          parameters: {
            currencies: ['USD', 'EUR'],
            countryAuthorities: [
              { authority: 'CYSEC' },
              { authority: 'CYSEC', country: 'CY' },
              { authority: 'FSCM', country: 'GR' },
              { authority: 'FSCM', country: 'SP' },
            ],
          },
          credentialsDetails,
        } as CredentialsGroupedData,
      ]);
    });

    it('Should group to different groups if there is no currency', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsData[] = [
        { parameters: {}, credentialsDetails },
        { parameters: { authority: 'CYSEC', currency: 'USD' }, credentialsDetails },
        { parameters: { country: 'IL', currency: 'USD' }, credentialsDetails },
        { parameters: { country: 'CY', currency: 'USD' }, credentialsDetails },
        { parameters: { country: 'KNN', currency: 'EUR' }, credentialsDetails },
        { parameters: { country: 'HK' }, credentialsDetails },
        { parameters: { authority: 'GM' }, credentialsDetails },
      ];

      expect(CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData)).toStrictEqual([
        {
          parameters: {},
          credentialsDetails,
        },
        {
          parameters: {
            currencies: ['USD'],
            countryAuthorities: [
              { authority: 'CYSEC' },
              { country: 'IL' },
              { country: 'CY' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: {
            currencies: ['EUR'],
            countryAuthorities: [
              { country: 'KNN' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: {
            currencies: [],
            countryAuthorities: [
              { country: 'HK' },
              { authority: 'GM' },
            ],
          },
          credentialsDetails,
        },
      ]);
    });
  });

  describe('#groupToCredentialDataList', () => {
    it('Should return details with shared parameters', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsGroupedData[] = [{ parameters: {}, credentialsDetails }];

      expect(CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData)).toStrictEqual([
        { parameters: {}, credentialsDetails } as CredentialsData,
      ]);
    });

    it('Should ungroup list with the same currencies', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsGroupedData[] = [
        {
          parameters: {
            currencies: ['USD', 'EUR'],
            countryAuthorities: [
              { authority: 'CYSEC', country: 'CY' },
              { authority: 'FSCM', country: 'GG' },
            ],
          },
          credentialsDetails,
        },
      ];

      expect(CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData)).toStrictEqual([
        { parameters: { authority: 'CYSEC', country: 'CY', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', country: 'CY', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'GG', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'GG', currency: 'EUR' }, credentialsDetails },
      ]);
    });

    it('Should ungroup into two different groups with the same authority', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsGroupedData[] = [
        {
          parameters: { currencies: [], countryAuthorities: [{ authority: 'GM', country: 'CY' }] },
          credentialsDetails,
        },
        {
          parameters: { currencies: ['USD'], countryAuthorities: [{ authority: 'GM', country: 'CY' }] },
          credentialsDetails,
        },
      ];

      expect(CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData)).toStrictEqual( [
        { parameters: { authority: 'GM', country: 'CY' }, credentialsDetails },
        { parameters: { authority: 'GM', country: 'CY', currency: 'USD' }, credentialsDetails },
      ]);
    });

    it('Should ungroup without currencies', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsGroupedData[] = [
        { parameters: {}, credentialsDetails },
        {
          parameters: {
            currencies: [],
            countryAuthorities: [
              { authority: 'CYSEC' },
              { authority: 'GM', country: 'CY' },
              { country: 'IL' },
              { country: 'CY' },
              { country: 'KNN' },
              { country: 'HK' },
              { authority: 'GM' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: { currencies: ['USD'], countryAuthorities: [{ authority: 'GM', country: 'CY' }] },
          credentialsDetails,
        },
        {
          parameters: { currencies: ['EUR'], countryAuthorities: [{}] },
          credentialsDetails,
        },
      ];

      expect(CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData)).toStrictEqual([
        { parameters: {}, credentialsDetails },
        { parameters: { authority: 'CYSEC' }, credentialsDetails },
        { parameters: { authority: 'GM', country: 'CY' }, credentialsDetails },
        { parameters: { country: 'IL' }, credentialsDetails },
        { parameters: { country: 'CY' }, credentialsDetails },
        { parameters: { country: 'KNN' }, credentialsDetails },
        { parameters: { country: 'HK' }, credentialsDetails },
        { parameters: { authority: 'GM' }, credentialsDetails },
        { parameters: { authority: 'GM', country: 'CY', currency: 'USD' }, credentialsDetails },
        { parameters: { currency: 'EUR' }, credentialsDetails },
      ]);
    });

    it('Should ungroup parameters with different groups', () => {
      const credentialsFSCM: CredentialDetails[] = [
        { key: 'organisationId', value: '14236' },
        { key: 'salt', value: '6b5l02CcVUUMGh4qnxcZW_U_' },
      ];
      const credentialsGMKNN: CredentialDetails[] = [
        { key: 'organisationId', value: '14131' },
        { key: 'salt', value: 'k3b7OxcTzcKHywGLu-sL89Z' },
      ];
      const credentialsData: CredentialsGroupedData[] = [
        {
          parameters: {
            currencies: ['ZAR'],
            countryAuthorities: [
              { authority: 'FSCM' },
            ],
          },
          credentialsDetails: credentialsFSCM,
        },
        {
          parameters: {
            currencies: ['ZAR'],
            countryAuthorities: [
              { authority: 'GM' },
              { authority: 'KNN' },
            ],
          },
          credentialsDetails: credentialsGMKNN,
        },
      ];

      expect(CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData)).toStrictEqual([
        { parameters: { authority: 'FSCM', currency: 'ZAR' }, credentialsDetails: credentialsFSCM },
        { parameters: { authority: 'GM', currency: 'ZAR' }, credentialsDetails: credentialsGMKNN },
        { parameters: { authority: 'KNN', currency: 'ZAR' }, credentialsDetails: credentialsGMKNN },
      ]);
    });

    it('Should ungroup with the same currencies with different payload', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsGroupedData[] = [
        {
          parameters: {
            currencies: ['USD', 'EUR'],
            countryAuthorities: [
              { authority: 'CYSEC' },
              { authority: 'CYSEC', country: 'CY' },
              { authority: 'FSCM', country: 'GR' },
              { authority: 'FSCM', country: 'SP' },
            ],
          },
          credentialsDetails,
        },
      ];

      expect(CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData)).toStrictEqual([
        { parameters: { authority: 'CYSEC', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', country: 'CY', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'CYSEC', country: 'CY', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'GR', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'GR', currency: 'EUR' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'SP', currency: 'USD' }, credentialsDetails },
        { parameters: { authority: 'FSCM', country: 'SP', currency: 'EUR' }, credentialsDetails },
      ]);
    });

    it('Should group to different groups if there is no currency', () => {
      const credentialsDetails: CredentialDetails[] = [];
      const credentialsData: CredentialsGroupedData[] = [
        {
          parameters: {},
          credentialsDetails,
        },
        {
          parameters: {
            currencies: ['USD'],
            countryAuthorities: [
              { authority: 'CYSEC' },
              { country: 'IL' },
              { country: 'CY' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: {
            currencies: ['EUR'],
            countryAuthorities: [
              { country: 'KNN' },
            ],
          },
          credentialsDetails,
        },
        {
          parameters: {
            currencies: [],
            countryAuthorities: [
              { country: 'HK' },
              { authority: 'GM' },
            ],
          },
          credentialsDetails,
        },
      ];

      expect(CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData)).toStrictEqual([
        { parameters: {}, credentialsDetails },
        { parameters: { authority: 'CYSEC', currency: 'USD' }, credentialsDetails },
        { parameters: { country: 'IL', currency: 'USD' }, credentialsDetails },
        { parameters: { country: 'CY', currency: 'USD' }, credentialsDetails },
        { parameters: { country: 'KNN', currency: 'EUR' }, credentialsDetails },
        { parameters: { country: 'HK' }, credentialsDetails },
        { parameters: { authority: 'GM' }, credentialsDetails },
      ]);
    });
  });
});
