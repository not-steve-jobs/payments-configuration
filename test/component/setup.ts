import request from 'supertest';

import { Roles } from '@api/middlewares/roles';

import { getConfig } from './utils';

const config = getConfig();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { Test } = request;
Test.prototype.withAuth = function(role: Roles = Roles.ADMIN) {
  return this
    .set('x-api-key', config.auth.apiKey)
    .set('x-api-role', role);
};
