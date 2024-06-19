import { Roles } from '../src/api/middlewares';

declare module 'supertest' {
  interface Test extends superagent.SuperAgentRequest {
    withAuth(role?: Roles = Roles.ADMIN): this;
  }
}
