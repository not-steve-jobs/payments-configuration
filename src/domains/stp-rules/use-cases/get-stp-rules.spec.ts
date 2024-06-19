import { StpRuleRepository } from '@infra';
import { GetStpRules } from '@domains/stp-rules';

describe('GetStpRules', () => {
  it('should handle empty currency list', async () => {
    const mockStpRuleRepository = mock<StpRuleRepository>({
      findAll: jest.fn().mockResolvedValue([]),
    });
    const service = new GetStpRules({
      stpRuleRepository: mockStpRuleRepository,
    });

    const result = await service.execute();

    expect(result).toEqual([]);
  });

  it('should return array of stp rules', async () => {
    const mockStpRuleRepository = mock<StpRuleRepository>({
      findAll: jest.fn().mockResolvedValue([
        { key: 'key1', description: null, order: 1, data: null },
        { key: 'key2', description: 'desc2', order: 2, data: JSON.stringify({ type: 'list', value: '["1", "2" ]' }) },
      ]),
    });
    const service = new GetStpRules({
      stpRuleRepository: mockStpRuleRepository,
    });

    const result = await service.execute();

    expect(result).toEqual([
      { key: 'key1', description: null, order: 1, data: null },
      { key: 'key2', description: 'desc2', order: 2, data: { type: 'list', value: '["1", "2" ]' } },
    ]);
  });
});
