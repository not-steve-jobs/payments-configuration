/**
 * WARNING! This is generated file. Keep it as it is.
 * It checks that Jest is correctly configured.
 */
describe('Test example', () => {
  it('Should pass', () => {
    type TestType = { prop1: string; prop2: number };
    const testFn = jest.fn();

    testFn(mock<TestType>({ prop2: 2 }));

    expect(testFn).toBeCalledOnceWith({ prop2: 2 });
  });
});
