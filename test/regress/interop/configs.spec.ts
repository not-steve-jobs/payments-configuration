import request from 'supertest';

import { generateCommonAuthorityAndCountryQueryParameters } from '@test-component/data';

import { getCountryAuthorities } from './tools';

describe('[REGRESS] GET api/interop/configs', () => {
  const sendRequest = (query: Record<string, unknown>): request.Test =>
    request(baseUrl).get('api/interop/configs').query(query);

  it.each(getCountryAuthorities())('Should be equal for $country and $authority', async ({ country, authority }) => {
    const query = generateCommonAuthorityAndCountryQueryParameters({ country, authority });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toMatchSnapshot();
  });
});
