import { ConflictError, NotFoundError, ValidationError } from '@internal/errors-library';
import {
  FieldOptionUpdateDto,
  FieldWithOptionsDto,
  ProviderFields,
  SpecificFieldsDto,
  SpecificFieldsParameters,
} from '@domains/providers/types';
import { buildKey, createUniqueHash } from '@utils';
import { MaxAllowedFieldsExceededError } from '@domains/providers/errors/max-allowed-fields-exceeded-error';
import { CountryAuthorityValidator } from '@domains/providers/validators';
import { CountryAuthorityEntity, TransactionType } from '@core';

interface ValidatePayloadOptions {
  currencies: string[];
  providerCountriesAuthorities: CountryAuthorityEntity[];
}

export class UpsertProviderFieldsValidator {
  private static readonly maxAllowedFieldsLength: number = 35_000;

  public static validateAndFormat(payload: ProviderFields, options: ValidatePayloadOptions): void | never {
    this.validateCommon(payload.common);
    this.validateAndFormatSpecific(payload.specific, options);
    this.validateFieldsCount(payload);
  }

  private static validateCommon(fields: FieldWithOptionsDto[]): void | never {
    const set = new Set<string>();

    for (const f of fields) {
      const key = buildKey(f.key, f.transactionType);
      if (set.has(key)) {
        throw new ConflictError(`Common fields contain duplicates`, { id: key });
      }

      this.validateOptions(f.options);
      this.validateFieldSchema(f);
      set.add(key);
    }
  }

  private static validateAndFormatSpecific(payload: SpecificFieldsDto[], options: ValidatePayloadOptions): void | never {
    this.validateCurrencies(payload, options.currencies);

    const paramsSet = new Set<string>();
    const fieldsSet = new Set<string>();

    for (const { parameters, fields } of payload) {
      this.formatParameters(parameters);

      const paramsHash = createUniqueHash(parameters);
      if (paramsSet.has(paramsHash)) {
        throw new ConflictError(`Parameters contain duplicates`, { id: paramsHash });
      }

      this.validateParameters(parameters, options);
      this.validateSpecificFieldsList(parameters, fields, fieldsSet);
      paramsSet.add(paramsHash);
    }
  }

  private static validateFieldsCount(payload: ProviderFields): void | never {
    const commonFieldsCount = payload.common.length;
    const specificFieldsCount = payload.specific.reduce((acc, s) => {
      const currenciesCount = s.parameters.currencies.length || 1;
      const caCount = s.parameters.countriesAuthorities.length || 1;
      const fieldsCount = s.fields.length || 1;
      return acc + (fieldsCount * currenciesCount * caCount);
    }, 0);

    const totalFieldsCount = commonFieldsCount + specificFieldsCount;
    if (totalFieldsCount > this.maxAllowedFieldsLength) {
      throw new MaxAllowedFieldsExceededError();
    }
  }

  private static validateCurrencies(payload: SpecificFieldsDto[], currencies: string[]): void | never {
    const currenciesToUpsert = Array.from(new Set(payload.flatMap(({ parameters }) => parameters.currencies)));

    const unknownCurrency = currenciesToUpsert.find(c => {
      if (!currencies.length) {
        return c;
      }

      return !currencies.find(cc => cc.toLowerCase() === c.toLowerCase());
    });

    if (unknownCurrency) {
      throw new NotFoundError(`Unknown currency "${unknownCurrency}"`, { id: unknownCurrency });
    }
  }

  private static validateSpecificFieldsList(parameters: SpecificFieldsParameters, fields: FieldWithOptionsDto[], set: Set<string>): void | never {
    const currencies = parameters.currencies.length ? parameters.currencies : [''];
    for (const { country, authority } of parameters.countriesAuthorities) {
      for (const currency of currencies) {
        for (const f of fields) {
          const key = buildKey(f.key, f.transactionType, country, authority, currency);
          if (set.has(key)) {
            throw new ConflictError(`Specific fields contain duplicates`, { id: key });
          }

          this.validateFieldSchema(f);
          set.add(key);
          this.validateOptions(f.options);
        }
      }
    }
  }

  private static validateFieldSchema(field: FieldWithOptionsDto): void | never {
    if ([TransactionType.PAYOUT, TransactionType.REFUND].includes(field.transactionType)) {
      if (!('name' in field)) {
        throw new ValidationError('Withdrawal field must have `name` property');
      }

      if (field.defaultValue) {
        throw new ValidationError('Withdrawal field can\'t have `defaultValue` property');
      }
    }

    if (field.transactionType === TransactionType.DEPOSIT) {
      if (field.name) {
        throw new ValidationError('Deposit field can\'t have `name` property');
      }

      if (!('defaultValue' in field)) {
        throw new ValidationError('Deposit field must have `defaultValue` property');
      }
    }
  }

  private static validateOptions(options: FieldOptionUpdateDto[]): void | never {
    const set = new Set<string>();

    for (const o of options) {
      const key = o.key.toLowerCase();

      if (set.has(key)) {
        throw new ConflictError(`Field options contain duplicates`, { id: o.key });
      }

      set.add(key);
    }
  }

  private static formatParameters(parameters: SpecificFieldsParameters): void {
    parameters.countriesAuthorities = parameters.countriesAuthorities
      .map(ca => ({ country: ca.country, authority: ca.authority }))
      .sort((a, b) => `${a.country}:${a.authority}`.localeCompare(`${b.country}:${b.authority}`));

    parameters.currencies = parameters.currencies.sort();
  }

  private static validateParameters(parameters: SpecificFieldsParameters, options: ValidatePayloadOptions): void {
    CountryAuthorityValidator.validate({
      countriesAuthorities: parameters.countriesAuthorities,
      countriesAuthoritiesBounded: options.providerCountriesAuthorities,
    });

    const currencySet = new Set<string>();
    for (const curr of parameters.currencies) {
      if (currencySet.has(curr)) {
        throw new ConflictError('Currencies list contain duplicates', { id: curr  });
      }
      currencySet.add(curr);
    }
  }
}
