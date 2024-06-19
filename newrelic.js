'use strict';
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

// Use require here, otherwise new relic initialization will break
// because it tries to initialize new relic before the configuration is setup
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { loadConfig } = require('@internal/core-library/lib/bootstrap/config');

let serviceConfig;

try {
  serviceConfig = loadConfig('./config');

} catch (err) {
  if (err.code === 'ENOENT') {
    // eslint-disable-next-line no-console
    console.warn('Could not initialize new relic, because env.properties is missing!');
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Could not initialize new relic! ${err.message}`);
  }
  return;
}

exports.config = serviceConfig.newRelic && serviceConfig.newRelic.config;
