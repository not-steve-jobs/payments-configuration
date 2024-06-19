import { AwilixContainer } from 'awilix';

declare global {
  namespace Express {
    export interface Request {
      container: AwilixContainer;
      user: UserDto;
    }

    interface User {
      roles: string[];
    }
  }
}
