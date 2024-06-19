import * as helpers from './helpers';

describe('helpers', () => {
  describe('getArgv', () => {
    it('Should parse config param', () => {
      const processArgv = ['--config=oneTwoThree'];

      const value = helpers.getArgv(processArgv, 'config', 'defaultValue');

      expect(value).toBe('oneTwoThree');
    });

    it('Should get fallbackValue if value is empty', () => {
      const processArgv = ['--config='];

      const value = helpers.getArgv(processArgv, 'config', 'defaultValue');

      expect(value).toBe('defaultValue');
    });

    it('Should get fallbackValue if there is no command', () => {
      const processArgv: string[] = [];

      const value = helpers.getArgv(processArgv, 'config', 'defaultValue');

      expect(value).toBe('defaultValue');
    });
  });
});
