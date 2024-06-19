import passportAzureAd from 'passport-azure-ad';
import * as passport from 'passport';

import { AuthConfig } from '@core/contracts';

interface AdAuthConfig {
  credentials: {
    tenantID: string;
    clientID: string;
  };
  metadata: {
    authority: string;
    discovery: string;
    version: string;
  };
  settings: {
    validateIssuer: boolean;
    passReqToCallback: boolean;
    loggingLevel: 'info' | 'warn' | 'error' | undefined;
    loggingNoPII: boolean;
  };
}

function buildAuthConfig(clientId: string, tenantId: string): AdAuthConfig {
  return {
    credentials: {
      tenantID: tenantId,
      clientID: clientId,
    },
    metadata: {
      authority: 'login.microsoftonline.com',
      discovery: '.well-known/openid-configuration',
      version: 'v2.0',
    },
    settings: {
      validateIssuer: false,
      passReqToCallback: true,
      loggingLevel: 'info' as  'info' | 'warn' | 'error' | undefined,
      loggingNoPII: false,
    },
  };
}

export const buildAzureAdStrategy = (config: AuthConfig): passport.Strategy => {
  const authConfig = buildAuthConfig(config.clientId, config.tenantId);

  return new passportAzureAd.BearerStrategy({
    // eslint-disable-next-line max-len
    identityMetadata: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
    issuer: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}`,
    clientID: authConfig.credentials.clientID,
    audience: authConfig.credentials.clientID,
    validateIssuer: authConfig.settings.validateIssuer,
    passReqToCallback: authConfig.settings.passReqToCallback,
    loggingLevel: authConfig.settings.loggingLevel,
    loggingNoPII: authConfig.settings.loggingNoPII,
  }, (req, payload, done) => {
    if (!payload.hasOwnProperty('scp') && !payload.hasOwnProperty('roles')) {
      return done(new Error('Unauthorized'), null, 'No delegated or app permission claims found');
    }

    return done(null, payload);
  });
};
