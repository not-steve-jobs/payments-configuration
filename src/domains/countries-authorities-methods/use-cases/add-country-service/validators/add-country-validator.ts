import { BadRequestError } from '@internal/errors-library';

import { AddCountryParams } from '../types';

export class AddCountryValidator {
  public static validate(params: AddCountryParams): void {
    if (!params.name) {
      throw new BadRequestError(`name can't be empty`);
    }
  }
}
