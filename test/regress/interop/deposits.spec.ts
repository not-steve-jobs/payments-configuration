import request from 'supertest';

import { generateGetDepositsQueryParameters } from '@test-component/data';

import { getCountryAuthorities, platformAndVersions } from './tools';

describe('[REGRESS] GET api/interop/configs/deposits', () => {
  const sendRequest = (query: Record<string, unknown>): request.Test =>
    request(baseUrl).get('api/interop/configs/deposits').query(query);

  describe.each(getCountryAuthorities())('Scenarios for $country and $authority', ({ country, authority }) => {
    it.each(platformAndVersions)('Should be equal for $platform and $version', async ({ platform, version }) => {
      const query = generateGetDepositsQueryParameters({ country, authority, platform, version });

      const { statusCode, body } = await sendRequest(query);

      expect(statusCode).toBe(200);
      expect(body).toMatchSnapshot();
    });
  });
});
