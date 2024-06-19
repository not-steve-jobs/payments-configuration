import { PspCredentialsDataMapper } from '@domains/providers/mappers';
import { PspCredentialsResponse } from '@infra';
import { CredentialsGroupedData } from '@domains/providers';

describe('PspCredentialsDataMapper', () => {
  describe('#mapToPspCredentials', () => {
    it('should map credentials with default parameters', () => {
      const credentials = [{
        parameters: {},
        credentialsDetails: [{ key: 'username', value: 'john_doe' }],
      }];

      const result = PspCredentialsDataMapper.mapToPspCredentials(credentials);

      expect(result.credentialsData).toHaveLength(1);
      expect(result.credentialsData[0].parameters).toEqual({});
      expect(result.credentialsData[0].credentialsDetails).toEqual({ username: 'john_doe' });
    });

    it('should map credentials with multiple parameters', () => {
      const credentials = [{
        parameters: {
          countryAuthorities: [{ authority: 'auth1', country: 'country1' }],
          currencies: ['USD', 'EUR'],
        },
        credentialsDetails: [{ key: 'password', value: 'secure_pass' }],
      }];

      const result = PspCredentialsDataMapper.mapToPspCredentials(credentials);

      expect(result.credentialsData).toHaveLength(2);
      expect(result.credentialsData[0].parameters).toEqual({
        authority: 'AUTH1',
        country: 'COUNTRY1',
        currency: 'USD',
      });
      expect(result.credentialsData[1].parameters).toEqual({
        authority: 'AUTH1',
        country: 'COUNTRY1',
        currency: 'EUR',
      });
      result.credentialsData.forEach(c => {
        expect(c.credentialsDetails).toEqual({ password: 'secure_pass' });
      });
    });

    it('should map all credentials types and merge default to others', () => {
      const credentials = [
        {
          parameters: {},
          credentialsDetails: [{ key: 'apiUrl', value: 'https://myapi.com' }],
        },
        {
          parameters: {
            countryAuthorities: [{ authority: 'auth1', country: 'country1' }, { authority: 'auth1', country: 'country1' }],
            currencies: ['EUR'],
          },
          credentialsDetails: [{ key: 'password', value: 'secure_pass' }],

        },
      ];

      const result = PspCredentialsDataMapper.mapToPspCredentials(credentials);

      expect(result.credentialsData).toHaveLength(3);
      expect(result.credentialsData[0].parameters).toEqual({});
      expect(result.credentialsData[0].credentialsDetails).toEqual({ apiUrl: 'https://myapi.com' });

      expect(result.credentialsData[1].parameters).toEqual({
        authority: 'AUTH1',
        country: 'COUNTRY1',
        currency: 'EUR',
      });
      expect(result.credentialsData[1].credentialsDetails).toEqual({ apiUrl: 'https://myapi.com', password: 'secure_pass' });
    });

    it('should throw BadRequestError when missing parameters', () => {
      const credentials: CredentialsGroupedData[] = [{
        parameters: {
          countryAuthorities: [{ country: 'country1' }],
          currencies: ['USD'],
        },
        credentialsDetails: [{ key: 'api_key', value: 'api_key_123' }],
      }];

      expect(() => PspCredentialsDataMapper.mapToPspCredentials(credentials)).toThrow('Not all parameters present!');
    });
  });

  describe('#mapToCredentialsData', () => {
    it('should map credentials data correctly with parameters', () => {
      const pspCredentials: PspCredentialsResponse = {
        credentialsData: [
          {
            credentialsDetails: { key1: 'value1', key2: 'value2' },
            parameters: { authority: 'GM', country: 'CA', currency: 'EUR' },
          },
          {
            credentialsDetails: { key3: 'value3', key4: 'value4' },
            parameters: { authority: 'GM', country: 'CA', currency: 'USD' },
          },
        ],
      };

      const result = PspCredentialsDataMapper.mapToCredentialsData(pspCredentials);

      expect(result).toEqual([
        {
          credentialsDetails: [
            { key: 'key1', value: 'value1' },
            { key: 'key2', value: 'value2' },
          ],
          parameters: { authority: 'GM', country: 'CA', currency: 'EUR' },
        },
        {
          credentialsDetails: [
            { key: 'key3', value: 'value3' },
            { key: 'key4', value: 'value4' },
          ],
          parameters: { authority: 'GM', country: 'CA', currency: 'USD' },
        },
      ]);
    });

    it('should return empty credentials data', () => {
      const mockResponse = {
        credentialsData: [],
      };

      const result = PspCredentialsDataMapper.mapToCredentialsData(mockResponse);

      expect(result).toEqual([]);
    });
  });

  describe('#generateKeyValueCredentials', () => {
    it('should generate key-value credentials correctly', () => {
      const mockCreds = { key1: 'value1', key2: 'value2' };

      const result = PspCredentialsDataMapper['generateKeyValueCredentials'](mockCreds);

      expect(result).toEqual([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ]);
    });

    it('should return empty credentials object', () => {
      const mockCreds = {};

      const result = PspCredentialsDataMapper['generateKeyValueCredentials'](mockCreds);

      expect(result).toEqual([]);
    });
  });
});
