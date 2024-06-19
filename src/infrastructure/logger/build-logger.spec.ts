import { IConfig } from '@internal/logger-library/lib/legacy/config';

import { buildLogger } from './build-logger';

describe('buildLogger', () => {
  jest.spyOn(console, 'warn').mockImplementation();

  it('Should be defined', async () => {
    const appRoot = `${__dirname}/../../../`;
    const config = mock<IConfig>({
      env: 'local',
      plant: 'dev',
      graylog: {
        maxFieldByteSize: 1024,
        server: {
          host: 'localhost',
          port: 0,
        },
      },
    });

    const logger = await buildLogger(appRoot, config);

    expect(logger).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.alert).toBeDefined();
    expect(logger.error).toBeDefined();
  });
});
