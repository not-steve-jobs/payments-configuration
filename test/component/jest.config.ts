import defaultConfig from '@internal/component-test-library/lib/cfg/jest.config';
import { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
  ...defaultConfig,
  testTimeout: 300000,
  moduleNameMapper: {
    '^@test-component/(.*)$': '<rootDir>/$1',
    '^@core': '<rootDir>/../../src/core',
    '^@domains/(.*)$': '<rootDir>/../../src/domains/$1',
    '^@api/(.*)$': '<rootDir>/../../src/api/$1',
    '^@infra/(.*)$': '<rootDir>/../../src/infrastructure/$1',
  },
  setupFilesAfterEnv: defaultConfig.setupFilesAfterEnv!.concat(['<rootDir>/setup.ts']),
};

export default jestConfig;
