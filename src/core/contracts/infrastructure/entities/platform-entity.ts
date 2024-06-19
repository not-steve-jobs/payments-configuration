import { Entity, MobilePlatforms } from '@core';

/**
 * Table: cp_platforms
 */
export interface PlatformEntity extends Entity {
  name: MobilePlatforms;
  version: string;
  date?: Date;
}
