import defaultConfig from '@internal/component-test-library/lib/cfg/jest.config';
import { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
  ...defaultConfig,
  testTimeout: 300000,
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^@test-component/(.*)$': '<rootDir>/../component/$1',
    '^@core': '<rootDir>/../../src/core',
  },
};

export default jestConfig;
