import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

describe('DataSetBuilder', () => {
  beforeEach(async () => {
    await cleanUp();
  });

  it('Should create stack', async () => {
    const entities = await DataSetBuilder
      .create()
      .withConfigs()
      .build();

    Object.values(entities).forEach(entity => {
      expect(entity).toBeDefined();
    });
  });

  it('Should override entity field after preset', async () => {
    const { transactionConfig } = await DataSetBuilder
      .create()
      .withConfigs({
        minAmount: 1000,
        createdBy: 'first',
      })
      .withTransactionConfig({
        createdBy: 'second',
      })
      .build();

    expect(transactionConfig.minAmount).toBe(1000);
    expect(transactionConfig.createdBy).toBe('second');
  });

  it('Should override entity fields with preset', async () => {
    const { transactionConfig } = await DataSetBuilder
      .create()
      .withTransactionConfig({
        minAmount: 1000,
        createdBy: 'first',
      })
      .withConfigs({
        createdBy: 'second',
      })
      .build();

    expect(transactionConfig.minAmount).toBe(1000);
    expect(transactionConfig.createdBy).toBe('second');
  });
});
