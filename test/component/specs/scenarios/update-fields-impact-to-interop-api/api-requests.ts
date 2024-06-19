import request from 'supertest';

export const sendGetFieldsRequest = (code: string): request.Test =>
  request(baseUrl)
    .get(`api/providers/${code}/fields`)
    .withAuth();

export const sendUpdateFieldsRequest = (code: string, payload: object): request.Test =>
  request(baseUrl)
    .put(`api/providers/${code}/fields/bulk-update`)
    .withAuth()
    .send(payload);

export const sendGetConfigsRequest = (query: Record<string, unknown>): request.Test =>
  request(baseUrl)
    .get('api/interop/configs')
    .query(query);

export const sendGetDepositConfigsRequest = (query: Record<string, unknown>): request.Test =>
  request(baseUrl)
    .get('api/interop/configs/deposits')
    .query(query);
