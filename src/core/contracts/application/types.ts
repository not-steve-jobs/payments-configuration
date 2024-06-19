import { ApplicationPlatforms } from '@core';

export type MobilePlatforms = Exclude<ApplicationPlatforms, ApplicationPlatforms.WEB>
