import casual from 'casual';

import { RepositoryTag } from '@infra/services';
import { ApplicationPlatforms } from '@core';

import { PlatformTagsFactory } from './platform-tags-factory';

describe('PlatformTagsFactory', () => {

  it(`Should create tags entities matching version pattern`, () => {
    const date = new Date().toISOString();
    const tags: RepositoryTag[] = [
      { name: '2.0.0', target: { date } },
      { name: '1.1.0', target: { date } },
      { name: 'v1.0.1', target: { date } },
      { name: '1.0.0', target: { date } },
      { name: casual.word, target: { date } },
      { name: '1.1', target: { date } },
      { name: '1', target: { date } },
    ];

    const result = PlatformTagsFactory.createPlatformTags(tags, ApplicationPlatforms.ANDROID);
    expect(result).toMatchObject([
      { version: '2.0.0' },
      { version: '1.1.0' },
      { version: '1.0.0' },
    ]);
  });
});
