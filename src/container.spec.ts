import { ExternalDependencies, createAppContainer } from './container';

describe('createAppContainer', () => {
  it('Should be resolved', () => {
    const options = mock<ExternalDependencies>({
      config: {
        redis: { server: {} },
        mysql: { host: '' },
        mssql: {
          host: '',
          database: '',
          port: 123,
          user: '',
          password: '',
        },
        direct: {
          mobileapp: {
            bitbucket: {
              android: {
                key: '',
                project: '',
              },
              ios: {
                key: '',
                project: '',
              },
              workspace: '',
            },
          },
        },
      },
      logger: {},
    });

    const container = createAppContainer(options);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    container.build(({ ...deps }: Record<string, unknown>) => {});

    expect(1).toBe(1);
  });
});
