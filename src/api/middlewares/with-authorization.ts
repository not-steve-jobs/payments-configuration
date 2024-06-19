import passport from 'passport';

import { ForbiddenError, UnauthorizedError } from '@internal/errors-library';
import { THttpMethod } from '@internal/core-library';
import { PaymentsConfigurationManagementServiceConfig } from '@core';

import { Roles } from './roles';
import { getLegacyUserRoles } from './get-legacy-user-roles';

const FORBIDDEN_MSG = 'You don\'t have permission for this operation. Please contact with administrator';

function checkPermissions(user: { roles: Roles[] }, roles: Roles[]): void | never {
  if (user.roles.some(r => roles.includes(r))) {
    return;
  }

  throw new ForbiddenError(FORBIDDEN_MSG);
}

export const withAuthorization = <B, Q, R>(endpointRoles: Roles[], controller: THttpMethod<B, Q, R>): THttpMethod<B, Q, R> =>
  (req, res, next) => {
    const { auth } = req.container.resolve<PaymentsConfigurationManagementServiceConfig>('config');

    function processWithAuthorization(user: { roles: Roles[] }): unknown {
      checkPermissions(user, endpointRoles);
      req.user = user;

      return controller(req, res, next);
    }

    function processWithLegacyAuthorization(authorizationHeader: string): unknown | null {
      try {
        const roles = getLegacyUserRoles(authorizationHeader) as Roles[];

        return processWithAuthorization({ roles });
      } catch (err: unknown) {
        return null;
      }
    }

    return new Promise((resolve, reject) => {
      const resolver = processWithLegacyAuthorization(req.headers.authorization ?? '');

      if (resolver) {
        return resolve(resolver);
      }

      function processWithAuthorizationOrThrow(user: { roles: Roles[]} ): void {
        try {
          const c = processWithAuthorization(user);

          return resolve(c);
        } catch (err: unknown) {
          return reject(err);
        }
      }

      if (auth.apiKey && req.headers['x-api-key'] === auth.apiKey) {
        const roles = (req.headers['x-api-role'] || '') as string;

        const user = { roles: roles.split(',') as Roles[] };

        return processWithAuthorizationOrThrow(user);
      }

      passport.authenticate('oauth-bearer', { session: false }, (err: unknown, user: { roles: Roles[] }, info: string) => {
        if (err || !user) {
          return reject(err || new UnauthorizedError(info));
        }

        return processWithAuthorizationOrThrow(user);
      })(req, res, next);
    });
  }
;
