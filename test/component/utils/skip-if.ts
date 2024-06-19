
// eslint-disable-next-line jest/no-export
export const skipIf = (condition: boolean): void => {
  if (condition) {
    // eslint-disable-next-line jest/no-focused-tests
    it.only('Skip tests', () => {
      // eslint-disable-next-line no-console
      console.log('Tests are skipped');
    });
  }
};
