import { ExportLimits, ExportLimitsOptions } from './export-limits';

describe('ExportLimits', () => {
  it('Should return empty report', async () => {
    const options = mock<ExportLimitsOptions>({
      providerMethodRepository: {
        getLimitsStats: jest.fn().mockResolvedValue([]),
      },
    });

    const service = new ExportLimits(options);

    expect(await service.execute()).toStrictEqual({
      fileName: expect.stringMatching(/cp_export_limits_\d+\.csv/),
      data: '',
    });
  });
});
