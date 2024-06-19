import { buildConfig } from './build-config';

describe('buildConfig', () => {
  it('Should be defined', async () => {
    const appRoot = `${__dirname}/../../../`;

    const config = buildConfig(appRoot);

    expect(config).toBeDefined();
  });
});
